export const adsData = [
  {
    AdID: "AD001",
    Title: "PUBG Mobile 10% Bonus",
    ImageURL: "/ads/pubg.png",
    DisplayLocation: "Homepage Banner",
    TargetAudience: "All Users",
    StartDate: "2025-09-01",
    EndDate: "2025-09-30",
    Status: "Active",
    ImpressionCount: 12045,
  },
  {
    AdID: "AD002",
    Title: "Premium Upgrade Promo",
    ImageURL: "/ads/premium.png",
    DisplayLocation: "Wallet Screen",
    TargetAudience: "High Spenders",
    StartDate: "2025-08-15",
    EndDate: "2025-09-15",
    Status: "Draft",
    ImpressionCount: 0,
  },
  {
    AdID: "AD003",
    Title: "SYP Balance Reminder",
    ImageURL: "/ads/syp.png",
    DisplayLocation: "Top-up Page",
    TargetAudience: "Syrian Lira Users",
    StartDate: "2025-07-01",
    EndDate: "2025-07-30",
    Status: "Expired",
    ImpressionCount: 5400,
  },
];

export const adsGrid = [
  { field: "AdID", headerText: "Ad ID", width: "120", textAlign: "Center" },
  { field: "Title", headerText: "Title", width: "200" },
  {
    field: "ImageURL",
    headerText: "Asset",
    width: "150",
    textAlign: "Center",
    template: (props) => (
      <img
        src={props.ImageURL}
        alt={props.Title}
        className="w-14 h-8 object-cover rounded"
        onError={(e) => (e.target.src = "/fallback.png")}
      />
    ),
  },
  { field: "DisplayLocation", headerText: "Location", width: "180" },
  { field: "TargetAudience", headerText: "Audience", width: "180" },
  {
    field: "StartDate",
    headerText: "Start",
    width: "140",
    format: "yMd",
    textAlign: "Center",
  },
  {
    field: "EndDate",
    headerText: "End",
    width: "140",
    format: "yMd",
    textAlign: "Center",
  },
  {
    field: "ImpressionCount",
    headerText: "Impressions",
    width: "140",
    textAlign: "Right",
  },
];
