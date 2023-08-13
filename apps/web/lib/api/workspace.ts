import axios from './axios';

export async function getSessionWorkspaces(cookiesHeader?: string) {
  try {
    const result = await axios.get('/workspaces', {
      withCredentials: true,
      headers: {
        Cookie: cookiesHeader,
      },
    });

    return result.data;
  } catch {
    return;
  }
}
