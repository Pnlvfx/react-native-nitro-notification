const headers = new Headers({
  'accept': 'application/json',
  'content-type': 'application/json',
});

export const api = {
  headers,
  login: (token: string) => {
    headers.set('authorization', `Bearer ${token}`);
  },
  logout: () => {
    headers.delete('authorization');
  },
};
