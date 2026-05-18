// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** 此处后端没有提供注释 GET /vip-code/giftcode */
export async function giftCode(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.giftCodeParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseString>('/vip-code/giftcode', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 PUT /vip-code/giftcode */
export async function giftCode3(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.giftCode3Params,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseString>('/vip-code/giftcode', {
    method: 'PUT',
    params: {
      ...params,
    },
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 POST /vip-code/giftcode */
export async function giftCode2(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.giftCode2Params,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseString>('/vip-code/giftcode', {
    method: 'POST',
    params: {
      ...params,
    },
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 DELETE /vip-code/giftcode */
export async function giftCode5(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.giftCode5Params,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseString>('/vip-code/giftcode', {
    method: 'DELETE',
    params: {
      ...params,
    },
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 PATCH /vip-code/giftcode */
export async function giftCode4(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.giftCode4Params,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseString>('/vip-code/giftcode', {
    method: 'PATCH',
    params: {
      ...params,
    },
    ...(options || {}),
  })
}
