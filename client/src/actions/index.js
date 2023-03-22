import axios from 'axios';
import { FETCH_USER, FETCH_BLOGS, FETCH_BLOG } from './types';

export const fetchUser = () => async (dispatch) => {
  const res = await axios.get('/api/current_user');

  dispatch({ type: FETCH_USER, payload: res.data });
};

export const handleToken = (token) => async (dispatch) => {
  const res = await axios.post('/api/stripe', token);

  dispatch({ type: FETCH_USER, payload: res.data });
};

export const submitBlog = (values, file, history) => async (dispatch) => {
  // retrieve the s3 presigned url from the server
  const uploadConfig = await axios.get('/api/upload');

  // upload the file to s3
  await axios.put(uploadConfig.data.url, file, {
    headers: {
      // specify the file type, should be image/jpeg or will get an error
      // because we are only allowing jpeg files in the s3 bucket
      'Content-Type': file.type,
    },
  });

  const res = await axios.post('/api/blogs', {
    ...values,
    // pass the S3 key to our server and save it in the database
    imageUrl: uploadConfig.data.key,
  });

  history.push('/blogs');
  dispatch({ type: FETCH_BLOG, payload: res.data });
};

export const fetchBlogs = () => async (dispatch) => {
  const res = await axios.get('/api/blogs');

  dispatch({ type: FETCH_BLOGS, payload: res.data });
};

export const fetchBlog = (id) => async (dispatch) => {
  const res = await axios.get(`/api/blogs/${id}`);

  dispatch({ type: FETCH_BLOG, payload: res.data });
};
