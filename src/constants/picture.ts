/**
 * 图片审核状态 前端常量枚举
 * 对应后端 PictureReviewStatusEnum
 */

// 1. 状态值常量（和后端枚举值完全对应，类型安全）
export const PIC_REVIEW_STATUS_ENUM = {
  REVIEWING: 0, // 待审核
  PASS: 1, // 通过
  REJECT: 2, // 拒绝
} as const // 加上 as const，让值保持字面量类型，避免类型丢失

// 2. 状态值 -> 中文文本映射（和后端枚举的 text 对应）
export const PIC_REVIEW_STATUS_MAP: Record<number, string> = {
  [PIC_REVIEW_STATUS_ENUM.REVIEWING]: '待审核',
  [PIC_REVIEW_STATUS_ENUM.PASS]: '通过',
  [PIC_REVIEW_STATUS_ENUM.REJECT]: '拒绝',
}

// 3. 组件选项数组（给 Ant Design Select/Tag 等组件直接使用）
export const PIC_REVIEW_STATUS_OPTIONS = Object.entries(PIC_REVIEW_STATUS_MAP).map(
  ([value, label]) => ({
    label,
    value: Number(value), // 转成数字类型，和后端 int 类型对齐，避免类型问题
  }),
)

// 4. 工具函数（对应后端的 getByValue 方法，快速获取状态文本）
/**
 * 根据审核状态值获取对应的中文文本
 * @param value 审核状态值
 * @returns 状态文本，找不到返回空字符串
 */
export const getPicReviewStatusText = (value?: number): string => {
  if (value === undefined || value === null) return ''
  return PIC_REVIEW_STATUS_MAP[value] || ''
}


export const PICTURE_EDIT_MESSAGE_TYPE_ENUM = {
  INFO: 'INFO',
  ERROR: 'ERROR',
  ENTER_EDIT: 'ENTER_EDIT',
  EXIT_EDIT: 'EXIT_EDIT',
  EDIT_ACTION: 'EDIT_ACTION',
}

export const PICTURE_EDIT_MESSAGE_TYPE_MAP = {
  INFO: '发送通知',
  ERROR: '发送错误',
  ENTER_EDIT: '进入编辑状态',
  EXIT_EDIT: '退出编辑状态',
  EDIT_ACTION: '执行编辑操作',
}

export const PICTURE_EDIT_ACTION_ENUM = {
  ZOOM_IN: 'ZOOM_IN',
  ZOOM_OUT: 'ZOOM_OUT',
  ROTATE_LEFT: 'ROTATE_LEFT',
  ROTATE_RIGHT: 'ROTATE_RIGHT',
}

export const PICTURE_EDIT_ACTION_MAP = {
  ZOOM_IN: '放大操作',
  ZOOM_OUT: '缩小操作',
  ROTATE_LEFT: '左旋操作',
  ROTATE_RIGHT: '右旋操作',
}
