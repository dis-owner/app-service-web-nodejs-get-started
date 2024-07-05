import React from 'react';
import useStore from '@store/store';
import ReactMarkdown from 'react-markdown';
import { BlobServiceClient, StorageSharedKeyCredential } from '@azure/storage-blob';
import { Buffer } from 'buffer';

// 引用サイドメニュー 2024.5.27 nemoto
const CitationMenu = () => {
  const isCitationMenu = useStore((state) => state.isCitationMenu);
  const setIsCitationMenu = useStore((state) => state.setIsCitationMenu);
  
  const citationContent = useStore((state) => state.citationContent);

  const divStyle: React.CSSProperties = {
    color: 'white',
    fontSize: '14px',
    position: 'fixed',
    right: isCitationMenu ? '0' : '-300px', // 表示/非表示の位置
    top: '0',
    height: '100%',
    width: '300px',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
    transition: 'right 0.3s', // スライドアニメーション
    overflow: 'auto',
  };

  const closeButtonStyle: React.CSSProperties = {
    position: 'absolute',
    top: '10px',
    right: '10px',
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: 'white',
  };


  //新規追加 20240529
  // コンテナ名
  const containerName = import.meta.env.VITE_CONTAINER_NAME?? '';
  // 呼び出したいファイル名
  const blobName = citationContent.title;
  window.Buffer = Buffer;
  const sasToken =import.meta.env.VITE_SAS_TOKEN?? '';
  const accountUrl =import.meta.env.VITE_STORAGE_ACCAUNT?? '';
  
    // BlobServiceClientを作成
    const blobServiceClient = new BlobServiceClient(`${accountUrl}?${sasToken}`);
    // コンテナクライアントを取得
    const containerClient = blobServiceClient.getContainerClient(containerName);
    // ブロブクライアントを取得
    const blobClient = containerClient.getBlobClient(blobName);
  
    // ブロブをダウンロード
    const downloadBlockBlobResponse =  blobClient.url;
    //ここまで

  return (
    <>
       <div style={divStyle}>
        <button
          onClick={() => setIsCitationMenu(false)}
          style={closeButtonStyle}
        >
          ×
        </button>
        {/* 引用サイトメニュー表示部分 */}
        <p style={{ fontSize: '20px', margin: '0' }}>引用</p>
        <div style={{ padding: '10px' }}>
        
          {/* <ReactMarkdown>{citationContent.content}</ReactMarkdown>*/}
          <iframe title="Citation" src={downloadBlockBlobResponse} width="100%" height="810px" />
        </div>

      </div>
    </>
  );
};
export default CitationMenu;