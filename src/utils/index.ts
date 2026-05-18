
// 分析图片大小
import { saveAs } from 'file-saver'

export const formatSize = (size?: number): string => {
  if (!size) return '未知'
  if (size < 1024) return size + ' B'
  if (size < 1024 * 1024) return (size / 1024).toFixed(2) + ' KB'
  return (size / (1024 * 1024)).toFixed(2) + ' MB'
}

/**
 * 下载图片
 * @param url
 * @param fileName
 */
export function downloadImage(url?: string, fileName?: string) {
  if (!url) {
    return
  }
  saveAs(url, fileName)
}


/**
 * 将颜色值转换为标准 #RRGGBB 格式
 * @param input
 */
export function toHexColor(input: string): string {
  // 去掉 0x 前缀
  const colorValue: string = input.startsWith('0x') ? input.slice(2) : input;

  // 将剩余部分分解析为十六进制数，再转成 6 位十六进制字符串
  const hexColor: string = parseInt(colorValue, 16).toString(16).padStart(6, '0');

  // 返回标准 #RRGGBB 格式
  return `#${hexColor}`;
}
