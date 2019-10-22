import axios from 'axios';
import { map, path, prop } from 'ramda';

const normalizeRecord = rec => ({
  id: prop('id', rec),
  publishedAt: path(['snippet', 'publishedAt'], rec),
  title: path(['snippet', 'title'], rec),
  description: path(['snippet', 'description'], rec),
  videoId: path(['contentDetails', 'videoId'], rec),
  privacyStatus: path(['status', 'privacyStatus'], rec),
  channelId: path(['snippet', 'channelId'], rec),
  channelTitle: path(['snippet', 'channelTitle'], rec),
  thumbnail: path(['snippet', 'thumbnails', 'maxres', 'url'], rec),
});

const normalizeRecords = map(normalizeRecord);

const getApi = () => {
  const rateLimit = 500;
  let lastCalled = null;

  const rateLimiter = call => {
    const now = Date.now();
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
  });

  api.interceptors.request.use(rateLimiter);

  return api;
};

export const createVideoNodesFromChannelId = async (
  channelId,
  apiKey,
  maxVideos = 15
) => {
  const api = getApi();
  let videos = [];

  const channelResp = await api.get('channels', {
    params: {
      part: 'contentDetails',
      id: channelId,
      key: apiKey,
    },
  });

  const channelData = channelResp.data.items[0];
  if (!!channelData) {
    const uploadsId = path(
      ['contentDetails', 'relatedPlaylists', 'uploads'],
      channelData
    );
    let pageSize = maxVideos;
    const part = 'snippet,contentDetails,status';

    let videoResp = await api.get('playlistItems', {
      params: {
        part,
        maxResults: pageSize,
        playlistId: uploadsId,
        key: apiKey,
      },
    });
    videos.push(...videoResp.data.items);

    while (videoResp.data.nextPageToken && videos.length < maxVideos) {
      pageSize = maxVideos - videos.length;
      let nextPageToken = videoResp.data.nextPageToken;
      videoResp = await api.get('playlistItems', {
        params: {
          part,
          maxResults: pageSize,
          playlistId: uploadsId,
          pageToken: nextPageToken,
          key: apiKey,
        },
      });
      videos.push(...videoResp.data.items);
    }
  }
  return normalizeRecords(videos);
};

export const str = JSON.stringify;
