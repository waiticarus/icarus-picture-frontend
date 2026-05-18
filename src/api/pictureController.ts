// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** 此处后端没有提供注释 POST /picture/delete */
export async function deletePicture(body: API.DeleteRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponseBoolean>('/picture/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 POST /picture/edit */
export async function editPicture(body: API.EditPictureRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponseBoolean>('/picture/edit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 POST /picture/edit/batch */
export async function editPictureByBatch(
  body: API.PictureEditByBatchRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseBoolean>('/picture/edit/batch', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 GET /picture/get */
export async function getPictureById(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getPictureByIdParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponsePicture>('/picture/get', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 GET /picture/get/vo */
export async function getPictureVoById(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getPictureVOByIdParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponsePictureVO>('/picture/get/vo', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 POST /picture/list/page */
export async function listPictureByPage(
  body: API.PictureQueryRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponsePagePicture>('/picture/list/page', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 POST /picture/list/page/vo */
export async function listPictureVoByPage(
  body: API.PictureQueryRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponsePagePictureVO>('/picture/list/page/vo', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 POST /picture/list/page/vo/cache */
export async function listPictureVoByPageWithCache(
  body: API.PictureQueryRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponsePagePictureVO>('/picture/list/page/vo/cache', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 POST /picture/out_painting/create_task */
export async function createPictureOutPaintingTask(
  body: API.CreatePictureOutPaintingTaskRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseCreateOutPaintingTaskResponse>(
    '/picture/out_painting/create_task',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      data: body,
      ...(options || {}),
    },
  )
}

/** 此处后端没有提供注释 GET /picture/out_painting/get_task */
export async function getPictureOutPaintingTask(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getPictureOutPaintingTaskParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseGetOutPaintingTaskResponse>('/picture/out_painting/get_task', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 POST /picture/review */
export async function doPictureReview(
  body: API.PictureReviewRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseBoolean>('/picture/review', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 POST /picture/search/color */
export async function searchPictureByColor(
  body: API.SearchPictureByColorRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseListPictureVO>('/picture/search/color', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 POST /picture/search/picture */
export async function searchPictureByPicture(
  body: API.SearchPictureByPictureRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseListImageSearchResult>('/picture/search/picture', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 GET /picture/tag_category */
export async function listPictureTagCategory(options?: { [key: string]: any }) {
  return request<API.BaseResponsePictureTagCategory>('/picture/tag_category', {
    method: 'GET',
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 POST /picture/update */
export async function updatePicture(
  body: API.UpdatePictureRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseBoolean>('/picture/update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

// /** 此处后端没有提供注释 POST /picture/upload */
// export async function uploadPicture(
//   // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
//   params: API.uploadPictureParams,
//   body: {},
//   options?: { [key: string]: any }
// ) {
//   return request<API.BaseResponsePictureVO>('/picture/upload', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     params: {
//       ...params,
//       pictureUploadRequest: undefined,
//       ...params['pictureUploadRequest'],
//     },
//     data: body,
//     ...(options || {}),
//   })
// }

export async function uploadPicture(
  params: any,
  body: any,
  file: File,
  options?: { [key: string]: any },
) {
  // 1. 创建 FormData 格式（文件上传唯一格式）
  const formData = new FormData()

  // 2. 追加文件（后端 @RequestPart("file") 对应 key 必须是 file）
  formData.append('file', file)

  // 3. 合并 params + body 参数，追加到 FormData
  const allParams = { ...params, ...body }
  Object.keys(allParams).forEach((key) => {
    const value = allParams[key]
    if (value !== undefined && value !== null) {
      formData.append(key, value)
    }
  })

  // ✅ 核心修复：发送 POST 请求，并返回 Promise 结果
  return request('/picture/upload', {
    // 这里换成你的真实上传接口地址
    method: 'POST',
    data: formData,
    // ✅ 必须配置：文件上传请求头
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    ...(options || {}),
  })
}

// 1. 注意入参，直接接收 File 对象
export async function uploadAvatarFile(file: File) {
  const formData = new FormData()

  // 2. 确保这里 append 的是一个原生的 File 对象，不要写成 formData.append('file', { file })
  formData.append('file', file)

  return request('/picture/upload/avatar', {
    method: 'POST',
    data: formData,
    // ⚠️ 极其重要：把 headers 里的 'Content-Type': 'multipart/form-data' 删掉！
    // Axios 只要看到 data 是 FormData，会自动加上带 boundary 的请求头。
    // 手动加很容易导致解析错误！
  })
}

/** 此处后端没有提供注释 POST /picture/upload/batch */
export async function uploadPictureBatch(
  body: API.PictureUploadByBatchRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseInteger>('/picture/upload/batch', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 POST /picture/upload/url */
export async function uploadPictureByUrl(
  body: API.PictureUploadRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponsePictureVO>('/picture/upload/url', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 分页获取当前登录用户上传的公开图片（附带完整条件搜索） */
export async function listMyPublicPicturesPage(
  body: API.PictureQueryRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponsePagePictureVO>('/picture/list/my/public/page', {
    // 改成了 POST 请求
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    // 参数以 body 的形式发送
    data: body,
    ...(options || {}),
  })
}
