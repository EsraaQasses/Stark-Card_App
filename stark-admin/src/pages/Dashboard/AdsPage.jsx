import React, { useState } from "react";
import { GridComponent, ColumnsDirective, ColumnDirective, Search, Page, Toolbar, Inject } from "@syncfusion/ej2-react-grids";
import Button from "../../components/Button";
import { PlusCircle, Eye, Pause, Play, Trash2 } from "lucide-react";
import { adsData, adsGrid } from "../../data/adsData";

const AdsPage = () => {
  const [data, setData] = useState(adsData);

  const handleDelete = (id) => {
    setData((prev) => prev.filter((ad) => ad.AdID !== id));
  };

  const toggleStatus = (id) => {
    setData((prev) =>
      prev.map((ad) =>
        ad.AdID === id
          ? { ...ad, Status: ad.Status === "Active" ? "Paused" : "Active" }
          : ad
      )
    );
  };

  const actionTemplate = (props) => (
    <div className="flex items-center gap-2">
      <Button size="sm" variant="outline">
        <Eye className="w-4 h-4 mr-1" /> Edit
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => toggleStatus(props.AdID)}
      >
        {props.Status === "Active" ? (
          <Pause className="w-4 h-4 mr-1" />
        ) : (
          <Play className="w-4 h-4 mr-1" />
        )}
        {props.Status === "Active" ? "Pause" : "Activate"}
      </Button>
      <Button
        size="sm"
        variant="destructive"
        onClick={() => handleDelete(props.AdID)}
      >
        <Trash2 className="w-4 h-4 mr-1" /> Delete
      </Button>
    </div>
  );

  const statusTemplate = (props) => {
    const color =
      props.Status === "Active"
        ? "bg-green-100 text-green-800"
        : props.Status === "Draft"
        ? "bg-gray-100 text-gray-800"
        : "bg-red-100 text-red-800";
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}
      >
        {props.Status}
      </span>
    );
  };

  const imageTemplate = (props) => (
    <img
      src={props.ImageURL}
      alt={props.Title}
      className="w-14 h-8 object-cover rounded"
      onError={(e) => (e.target.src = "/fallback.png")}
    />
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Ads Management</h2>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <PlusCircle className="w-5 h-5 mr-2" /> Add New Ad
        </Button>
      </div>

      <GridComponent
        dataSource={data}
        allowPaging
        allowSorting
        toolbar={["Search"]}
        pageSettings={{ pageSize: 10 }}
        width="100%"
      >
        <ColumnsDirective>
          {adsGrid.map((col, index) => (
            <ColumnDirective key={index} {...col} />
          ))}
          <ColumnDirective
            headerText="Status"
            width="120"
            textAlign="Center"
            template={statusTemplate}
          />
          <ColumnDirective
            headerText="Actions"
            width="250"
            textAlign="Center"
            template={actionTemplate}
          />
        </ColumnsDirective>
        <Inject services={[Search, Page, Toolbar]} />
      </GridComponent>
    </div>
  );
};

export default AdsPage;
