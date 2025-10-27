// utils/methods.js
import { headers } from '../services/headers';

export const METHODS = {
  POST: (build, url, defaultBody = {}, defaultHeaders = headers) =>
    build.mutation({
      query: body => ({
        url,
        method: 'POST',
        body: { ...defaultBody, ...body },
        headers: { ...defaultHeaders },
      }),
    }),

  GET: (build, url, defaultParams = {}, defaultHeaders = headers) =>
    build.query({
      query: params => {
        const queryParams = new URLSearchParams({
          ...defaultParams,
          ...params,
        }).toString();

        return {
          url: queryParams ? `${url}?${queryParams}` : url,
          method: 'GET',
          headers: { ...defaultHeaders },
        };
      },
    }),

  PUT: (build, url, defaultBody = {}, defaultHeaders = headers) =>
    build.mutation({
      query: body => ({
        url,
        method: 'PUT',
        body: { ...defaultBody, ...body },
        headers: { ...defaultHeaders },
      }),
    }),

  PATCH: (build, url, defaultBody = {}, defaultHeaders = headers) =>
    build.mutation({
      query: body => ({
        url,
        method: 'PATCH',
        body: { ...defaultBody, ...body },
        headers: { ...defaultHeaders },
      }),
    }),

  DELETE: (build, url, defaultParams = {}, defaultHeaders = headers) =>
    build.mutation({
      query: params => {
        const queryParams = new URLSearchParams({
          ...defaultParams,
          ...params,
        }).toString();

        return {
          url: queryParams ? `${url}?${queryParams}` : url,
          method: 'DELETE',
          headers: { ...defaultHeaders },
        };
      },
    }),
};
