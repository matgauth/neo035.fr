import axios from 'axios';
import { map, path, prop, toLower, split, pipe, without, last } from 'ramda';
import camelCase from 'lodash.camelcase';
import config from '@config';

const normalizePlaylistRecord = rec => ({
  id: prop('id', rec),
  publishedAt: path(['snippet', 'publishedAt'], rec),
  title: path(['snippet', 'title'], rec),
  videoCount: path(['contentDetails', 'itemCount'], rec),
  channelId: path(['snippet', 'channelId'], rec),
  channelTitle: path(['snippet', 'channelTitle'], rec),
  thumbnail: path(['snippet', 'thumbnails', 'high', 'url'], rec),
});

const normalizePlaylistRecords = map(normalizePlaylistRecord);

const parseQuestions = (description, videoId) =>
  description.split`\n`.reduce((acc, prev) => {
    const pattern = prev.match(/[0-9]{1,2}:[0-9]{1,2}$/);
    if (pattern !== null) {
      const [time] = pattern,
        [min, sec] = time.split`:`;
      acc.push({
        label: prev.replace(time, ``).trim(),
        time: {
          text: time,
          link: `https://www.youtube.com/watch?v=${videoId}&t=${
            min ? `${min}m` : ``
          }${sec}s`,
        },
      });
    }
    return acc;
  }, []);

const normalizeVideoRecord = rec => {
  const videoId = path(['snippet', 'resourceId', 'videoId'], rec);
  const description = path(['snippet', 'description'], rec);
  return {
    id: prop('id', rec),
    publishedAt: path(['snippet', 'publishedAt'], rec),
    title: path(['snippet', 'title'], rec),
    questions: parseQuestions(description, videoId),
    videoId,
    thumbnail: path(['snippet', 'thumbnails', 'high', 'url'], rec),
  };
};

const normalizeVideoRecords = map(normalizeVideoRecord);

const getApi = () => {
  const rateLimit = 500;
  let lastCalled = null;

  const rateLimiter = call => {
    const now = new Date().getTime();
    if (lastCalled) {
      lastCalled += rateLimit;
      const wait = lastCalled - now;
      if (wait > 0) {
        return new Promise(resolve => setTimeout(() => resolve(call), wait));
      }
    }
    lastCalled = now;
    return call;
  };

  const api = axios.create({
    baseURL: 'https://www.googleapis.com/youtube/v3/',
    params: {
      prettyPrint: true,
    },
  });

  api.interceptors.request.use(rateLimiter);

  return api;
};

export const getPlaylistsFromChannelId = async (
  channelId,
  apiKey,
  maxResults = 20
) => {
  const api = getApi();

  const res = await api.get('playlists', {
    params: {
      part: 'snippet,contentDetails',
      fields:
        'items(id,snippet(publishedAt,thumbnails(high(url)),title),contentDetails(itemCount))',
      channelId,
      maxResults,
      key: apiKey,
    },
  });
  const playlistsFromConfig = config.playlists.map(toLower);
  const filteredRecords = res.data.items.filter(item => {
    const title = toLower(item.snippet.title);
    return playlistsFromConfig.includes(title);
  });
  return normalizePlaylistRecords(filteredRecords);
};

export const getVideosFromPlaylistId = async (
  playlistId,
  apiKey,
  maxVideos = 15
) => {
  const api = getApi();
  let videos = [];

  let pageSize = maxVideos;
  const part = 'snippet',
    fields =
      'items(id,snippet(publishedAt,title,description,thumbnails(high(url)),resourceId(videoId))),nextPageToken';

  let videoResp = await api.get('playlistItems', {
    params: {
      part,
      fields,
      maxResults: pageSize,
      playlistId,
      key: apiKey,
    },
  });
  videos.push(...videoResp.data.items);
  while (videoResp.data.nextPageToken) {
    videoResp = await api.get('playlistItems', {
      params: {
        part,
        fields,
        maxResults: pageSize,
        playlistId,
        pageToken: videoResp.data.nextPageToken,
        key: apiKey,
      },
    });
    videos.push(...videoResp.data.items);
  }

  return normalizeVideoRecords(videos);
};

export const str = JSON.stringify;

export const parsePath = pipe(
  split(`/`),
  without([``]),
  last,
  camelCase
);
