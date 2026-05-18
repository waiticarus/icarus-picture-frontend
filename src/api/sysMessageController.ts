// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** 此处后端没有提供注释 POST /message/handle */
export async function handleSysMessage(
  body: API.SysMessageRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean>('/message/handle', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 GET /message/list/vo */
export async function getSysMessageList(options?: { [key: string]: any }) {
  return request<API.BaseResponseListSysMessageVO>('/message/list/vo', {
    method: 'GET',
    ...(options || {}),
  })
}
