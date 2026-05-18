// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** 此处后端没有提供注释 GET /sse/connect */
export async function connect(options?: { [key: string]: any }) {
  return request<API.SseEmitter>('/sse/connect', {
    method: 'GET',
    ...(options || {}),
  })
}
