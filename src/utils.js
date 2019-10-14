import axios from 'axios';
import get from 'lodash.get';

const normalizeRecords = (items = []) =>
  items.map(item => ({
    id: get(item, 'id'),
    publishedAt: get(item, 'snippet.publishedAt'),
    title: get(item, 'snippet.title'),
    description: get(item, 'snippet.description'),
    videoId: get(item, 'contentDetails.videoId'),
    privacyStatus: get(item, 'status.privacyStatus'),
    channelId: get(item, 'snippet.channelId'),
    channelTitle: get(item, 'snippet.channelTitle'),
    thumbnail: get(
      item,
      'snippet.thumbnails.maxres',
      get(
        item,
        'snippet.thumbnails.standard',
        get(
          item,
          'snippet.thumbnails.high',
          get(
            item,
            'snippet.thumbnails.medium',
            get(item, 'snippet.thumbnails.default')
          )
        )
      )
    ),
  }));

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
    const uploadsId = get(
      channelData,
      'contentDetails.relatedPlaylists.uploads'
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
