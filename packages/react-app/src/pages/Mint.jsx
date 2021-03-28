import React, { useState } from "react";
import { Button, Modal, DatePicker, Input, Space, TimePicker, Typography, Upload } from "antd";
import { UploadOutlined, PlusOutlined } from "@ant-design/icons";

function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

function PictureWall({ fileList, setFileList }) {
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");

  const handleCancel = () => setPreviewVisible("false");

  const handlePreview = async file => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewVisible(true);
    setPreviewTitle(file.name || file.file.url.substring(file.url.indexOf("/" + 1)));
  };

  const handleChange = change => setFileList(change.fileList);

  const UploadButton = () => (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  return (
    <>
      <Upload listType="picture-card" fileList={fileList} onPreview={handlePreview} onChange={handleChange}>
        {fileList.length >= 8 ? null : <UploadButton />}
      </Upload>
      <Modal visible={previewVisible} title={previewTitle} footer={null} onCancel={handleCancel}>
        <img alt="preview" style={{ width: "100%" }} src={previewImage} />
      </Modal>
    </>
  );
}

export default function Mint() {
  const [bannerImg, setBannerImg] = useState();
  const [title, setTitle] = useState("");
  const [dropDate, setDropDate] = useState();
  const [dropTime, setDropTime] = useState();
  const [description, setDescription] = useState("");
  const [fileList, setFileList] = useState([]);

  return (
    <Space align="start" direction="vertical" style={{ maxWidth: 500, margin: "auto" }}>
      <Typography.Title>Create a Mystery Drop</Typography.Title>
      <Typography.Title level={2}>Collection Details</Typography.Title>
      <Upload
        onChange={file => {
          setBannerImg(file);
        }}
      >
        <Button icon={<UploadOutlined />}>Upload Banner</Button>
      </Upload>
      <Input
        placeholder="Collection Name"
        onChange={event => {
          setTitle(event.target.value);
        }}
      />
      <DatePicker
        placeholder="Drop Date"
        onChange={date => {
          setDropDate(date);
        }}
      />
      <TimePicker
        placeholder="Drop Time"
        onChange={time => {
          setDropTime(time);
        }}
      />
      <Input.TextArea
        placeholder="Description"
        onChange={event => {
          setDescription(event.target.value);
        }}
      />
      <Typography.Title level={3}>Individual Pieces</Typography.Title>
      <PictureWall fileList={fileList} setFileList={setFileList} />
      <Button type="primary">Mint</Button>
    </Space>
  );
}
