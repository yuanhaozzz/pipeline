import request from 'umi-request'


export async function getuserList(value) {
  try {
    let arr = await request('/api/devices/info/find_user', {
      method: 'get',
      params: {
        username: value || ''
      }
    });
    arr = arr.map(item => {
      item.label = item.username;
      item.value = item.user_id;
      return item
    })
    return arr
  } catch (error) {
    console.log(error);
  }
}