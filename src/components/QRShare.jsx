import React, { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Share2, Copy, Check, Info, Smartphone, Download } from 'lucide-react'

const QRShare = () => {
  const [copied, setCopied] = useState(false)
  const [shareUrl, setShareUrl] = useState('')

  useEffect(() => {
    setShareUrl(window.location.origin)
  }, [])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  return (
    <div className="bg-brand-gray-50 dark:bg-brand-gray-950 border border-brand-gray-200 dark:border-brand-gray-800 rounded-3xl p-6 flex flex-col md:flex-row items-center gap-6">
      {/* Left side: QR Code */}
      <div className="flex flex-col items-center justify-center bg-white p-4 rounded-2xl border border-brand-gray-200 dark:border-brand-gray-800 shadow-sm">
        {shareUrl && (
          <QRCodeSVG
            value={shareUrl}
            size={140}
            bgColor="#ffffff"
            fgColor="#000000"
            level="H"
            includeMargin={false}
          />
        )}
        <span className="text-xs text-black mt-2 font-mono">掃描分享此 App</span>
      </div>

      {/* Right side: Instructions and PWA Guide */}
      <div className="flex-1 w-full space-y-4">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-brand-gray-500" />
            將 App 安裝至手機主畫面
          </h3>
          <p className="text-sm text-brand-gray-500 dark:text-brand-gray-400 mt-1">
            安裝為 PWA 後可享受全螢幕無邊框體驗、離線計時與極速載入！
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="bg-white dark:bg-brand-gray-900 p-3 rounded-xl border border-brand-gray-100 dark:border-brand-gray-800">
            <h4 className="font-bold flex items-center gap-1.5 mb-1.5">
              <span className="bg-black dark:bg-white text-white dark:text-black w-4 h-4 rounded-full flex items-center justify-center text-[10px]">1</span>
              iOS 蘋果手機安裝教學
            </h4>
            <ol className="list-decimal pl-4 space-y-1 text-brand-gray-500 dark:text-brand-gray-400">
              <li>使用 Safari 瀏覽器打開此網頁</li>
              <li>點擊瀏覽器底部的<strong>「分享」</strong>按鈕 <Share2 className="w-3 h-3 inline mb-0.5" /></li>
              <li>選單往下滑動，點選<strong>「加入主畫面」</strong></li>
            </ol>
          </div>

          <div className="bg-white dark:bg-brand-gray-900 p-3 rounded-xl border border-brand-gray-100 dark:border-brand-gray-800">
            <h4 className="font-bold flex items-center gap-1.5 mb-1.5">
              <span className="bg-black dark:bg-white text-white dark:text-black w-4 h-4 rounded-full flex items-center justify-center text-[10px]">2</span>
              Android 安卓手機安裝教學
            </h4>
            <ol className="list-decimal pl-4 space-y-1 text-brand-gray-500 dark:text-brand-gray-400">
              <li>使用 Chrome 瀏覽器打開此網頁</li>
              <li>點擊右上角<strong>「選單三圓點」</strong>按鈕</li>
              <li>點選<strong>「安裝應用程式」</strong>或<strong>「加入主畫面」</strong></li>
            </ol>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex-1 py-2.5 px-4 bg-black dark:bg-white text-white dark:text-black hover:bg-brand-gray-800 dark:hover:bg-brand-gray-100 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-colors duration-200 btn-active-scale"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                已複製網址
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                複製網頁連結
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default QRShare
