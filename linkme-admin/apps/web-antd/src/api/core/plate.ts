import { requestClient } from '#/api/request';


type PlateListReq = {
  page?: number;
  size?: number;
};


export async function getPlateList(data: PlateListReq) {
  return requestClient.post('/plate/list', data );
}
