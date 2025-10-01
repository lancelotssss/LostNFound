import React, { useState } from "react";
import { Card, Modal, Button } from "antd";

const { Meta } = Card;

export function SearchResultCardModal({ item }) {
  const [open, setOpen] = useState(false);

  const showModal = () => setOpen(true);
  const handleOk = () => setOpen(false);
  const handleCancel = () => setOpen(false);

  return (
    <>
      <Card
        hoverable
        style={{ width: 240 }}
        cover={
          <img
            draggable={false}
            alt={item.keyItem}
            src={
              item.photoUrl ||
              "https://community.softr.io/uploads/db9110/original/2X/7/74e6e7e382d0ff5d7773ca9a87e6f6f8817a68a6.jpeg"
            }
            style={{ height: 180, objectFit: "cover" }}
          />
        }
        onClick={showModal} // 🔹 open modal on card click
      >
        <Meta
          title={item.keyItem}
          description={
            <>
              <p>
                <b>Category:</b> {item.category}
              </p>
              <p>
                <b>Brand:</b> {item.itemBrand || "N/A"}
              </p>
              <p>
                <b>Location:</b> {item.location}
              </p>
              <p>
                <b>Date Found:</b>{" "}
                {item.dateFound
                  ? new Date(item.dateFound).toLocaleDateString()
                  : "N/A"}
              </p>
            </>
          }
        />
      </Card>

      <Modal
        open={open}
        title={item.keyItem}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={(_, { OkBtn, CancelBtn }) => (
          <>
            <Button type="primary">Claim</Button>
            <CancelBtn />
            <OkBtn />
          </>
        )}
      >
        <img
          src={
            item.photoUrl ||
            "https://community.softr.io/uploads/db9110/original/2X/7/74e6e7e382d0ff5d7773ca9a87e6f6f8817a68a6.jpeg"
          }
          alt={item.keyItem}
          style={{
            width: "100%",
            marginBottom: "15px",
            borderRadius: "8px",
            objectFit: "cover",
          }}
        />
        <p>
          <b>Category:</b> {item.category}
        </p>
        <p>
          <b>Brand:</b> {item.itemBrand || "N/A"}
        </p>
        <p>
          <b>Location:</b> {item.location}
        </p>
        <p>
          <b>Date Found:</b>{" "}
          {item.dateFound
            ? new Date(item.dateFound).toLocaleDateString()
            : "N/A"}
        </p>
        <p>
          <b>Description:</b> {item.description || "No description provided."}
        </p>
      </Modal>
    </>
  );
}
