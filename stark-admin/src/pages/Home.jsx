import React, { useEffect, useState } from "react";
import { GoPrimitiveDot } from "react-icons/go";
import { Link } from "react-router-dom";
import { Stacked } from "../components";
import { useStateContext } from "../contexts/ContextProvider";
import { earningData } from "../data/earningData";
import axiosInstance from "../utils/axiosConfig";

const Home = () => {
  const { currentMode } = useStateContext();
  const [stats, setStats] = useState({
    shipping: 0,
    pending: 0,
    inProgress: 0,
    objection: 0,
    totalUsers: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAllStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const requests = [
        axiosInstance.get("/shipping/count/").catch((Aerror) => {
          console.warn("Shipping count failed:", Aerror);
          return { data: { pending_count: 0 } };
        }),
        axiosInstance
          .get("all_requests/admin/requests/?status=pending")
          .catch((Berror) => {
            console.warn("Pending requests failed:", Berror);
            return { data: [] };
          }),
        axiosInstance
          .get("/all_requests/admin/requests/?status=in_progress")
          .catch((Cerror) => {
            console.warn("In progress requests failed:", Cerror);
            return { data: [] };
          }),
        axiosInstance
          .get("/all_requests/admin/requests/?status=objection")
          .catch((Derror) => {
            console.warn("Objection requests failed:", Derror);
            return { data: [] };
          }),
        axiosInstance.get("/users/stats/").catch((Eerror) => {
          console.warn("User stats failed:", Eerror);
          return { data: { total_users: 0 } };
        }),
      ];

      const [
        shippingResponse,
        pendingResponse,
        inProgressResponse,
        objectionResponse,
        usersResponse,
      ] = await Promise.all(requests);

      const allRequests = [
        ...(pendingResponse.data || []),
        ...(inProgressResponse.data || []),
        ...(objectionResponse.data || []),
      ];

      const totalRevenue = allRequests.reduce(
        (sum, request) => sum + (parseFloat(request.amount) || 0),
        0
      );

      setStats({
        shipping: shippingResponse.data?.pending_count || 0,
        pending: (pendingResponse.data || []).length,
        inProgress: (inProgressResponse.data || []).length,
        objection: (objectionResponse.data || []).length,
        totalUsers: usersResponse.data?.total_users || 0,
        totalRevenue,
      });
    } catch (Ferror) {
      console.error("Error fetching stats:", Ferror);
      setError(
        "Failed to load dashboard data. Some services may be unavailable."
      );
      setStats({
        shipping: 0,
        pending: 0,
        inProgress: 0,
        objection: 0,
        totalUsers: 0,
        totalRevenue: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllStats();
  }, []);

  const updatedEarningData = earningData.map((item) => {
    const titleKey = item.title.toLowerCase().replace(/\s+/g, "");

    if (titleKey.includes("shipping")) {
      return {
        ...item,
        amount: loading ? "..." : stats.shipping.toString(),
        description: `${stats.shipping} pending requests`,
      };
    }
    if (titleKey.includes("pending")) {
      return {
        ...item,
        amount: loading ? "..." : stats.pending.toString(),
        description: `${stats.pending} requests awaiting review`,
      };
    }
    if (titleKey.includes("progress")) {
      return {
        ...item,
        amount: loading ? "..." : stats.inProgress.toString(),
        description: `${stats.inProgress} active processes`,
      };
    }
    if (titleKey.includes("objection")) {
      return {
        ...item,
        amount: loading ? "..." : stats.objection.toString(),
        description: `${stats.objection} customer objections`,
      };
    }
    if (titleKey.includes("customer") || titleKey.includes("user")) {
      return {
        ...item,
        amount: loading ? "..." : stats.totalUsers.toString(),
        description: `${stats.totalUsers} total users`,
      };
    }
    if (titleKey.includes("revenue") || titleKey.includes("sales")) {
      return {
        ...item,
        amount: loading ? "..." : `$${stats.totalRevenue.toLocaleString()}`,
        description: "Total pending revenue",
      };
    }

    return item;
  });

  const refreshData = () => {
    fetchAllStats();
  };

  const getStatusColor = (count) => {
    if (count === 0) return "bg-green-500";
    if (count < 5) return "bg-yellow-500";
    return "bg-red-500 animate-pulse";
  };

  const getPriorityLevel = (count) => {
    if (count === 0) return "Low";
    if (count < 5) return "Medium";
    return "High";
  };

  const getPriorityClass = (level) => {
    if (level === "High") return "bg-red-100 text-red-800";
    if (level === "Medium") return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  const getCountForTitle = (titleKey) => {
    if (titleKey.includes("shipping")) return stats.shipping;
    if (titleKey.includes("pending")) return stats.pending;
    if (titleKey.includes("progress")) return stats.inProgress;
    if (titleKey.includes("objection")) return stats.objection;
    if (titleKey.includes("customer") || titleKey.includes("user"))
      return stats.totalUsers;
    return 0;
  };

  const handleErrorClose = () => {
    setError(null);
  };

  return (
    <div className="mt-24">
      <div className="flex justify-between items-center mb-6 px-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Dashboard Overview
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Real-time statistics and monitoring
          </p>
        </div>
        <button
          type="button"
          onClick={refreshData}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm flex items-center gap-2"
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              Loading...
            </>
          ) : (
            "Refresh Data"
          )}
        </button>
      </div>

      {error && (
        <div className="flex justify-center mb-4">
          <div
            className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded relative max-w-2xl mx-3"
            role="alert"
          >
            <strong className="font-bold">Notice: </strong>
            <span className="block sm:inline">{error}</span>
            <button
              type="button"
              onClick={handleErrorClose}
              className="absolute top-0 right-0 px-2 py-1"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap lg:flex-nowrap justify-center">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 m-3 justify-center items-center w-full max-w-6xl">
          {updatedEarningData.map((item) => {
            const titleKey = item.title.toLowerCase().replace(/\s+/g, "");
            const count = getCountForTitle(titleKey);
            const priorityLevel = getPriorityLevel(count);
            const priorityClass = getPriorityClass(priorityLevel);

            return (
              <Link
                key={item.title}
                to={`/${item.title.toLowerCase().replace(/\s+/g, "-")}`}
                className="block bg-white dark:text-gray-200 dark:bg-secondary-dark-bg p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 dark:border-gray-700 hover:scale-105 transform transition-transform duration-200 relative"
              >
                {!item.title.toLowerCase().includes("revenue") && (
                  <div className="absolute -top-2 -right-2 flex flex-col items-end">
                    {count > 0 && (
                      <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full mb-1">
                        {count} Pending
                      </span>
                    )}
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${priorityClass}`}
                    >
                      {priorityLevel} Priority
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">
                      {item.amount}
                      {loading && (
                        <span className="text-xs text-blue-500 ml-2">⟳</span>
                      )}
                    </p>
                    <p className="text-lg text-gray-600 dark:text-gray-300 mt-2 font-semibold">
                      {item.title}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {item.description}
                    </p>
                  </div>
                  <div
                    className="flex items-center justify-center w-16 h-16 rounded-full ml-4"
                    style={{ backgroundColor: item.iconBg }}
                  >
                    <span style={{ color: item.iconColor, fontSize: "24px" }}>
                      {item.icon}
                    </span>
                  </div>
                </div>

                {!item.title.toLowerCase().includes("revenue") && (
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <div
                        className={`w-3 h-3 rounded-full mr-2 ${getStatusColor(
                          count
                        )}`}
                      />
                      <span className="text-xs text-gray-500">
                        {count > 0
                          ? `${count} needs attention`
                          : "All caught up"}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">
                      {loading ? "Updating..." : "Live"}
                    </div>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex gap-6 flex-wrap justify-center mt-8">
        <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg m-3 p-6 rounded-2xl md:w-780">
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="font-semibold text-xl">Revenue Analytics</p>
              <p className="text-gray-500 text-sm">
                Real-time financial overview
              </p>
            </div>
            <div className="flex items-center gap-4">
              <p className="flex items-center gap-2 text-gray-600 hover:drop-shadow-xl">
                <span>
                  <GoPrimitiveDot className="text-blue-500" />
                </span>
                <span>USD Transactions</span>
              </p>
              <p className="flex items-center gap-2 text-green-400 hover:drop-shadow-xl">
                <span>
                  <GoPrimitiveDot />
                </span>
                <span>SYP Transactions</span>
              </p>
            </div>
          </div>
          <div className="mt-6 flex gap-8 flex-wrap justify-center">
            <div className="border-r-1 border-color m-4 pr-8">
              <div className="mb-6">
                <p>
                  <span className="text-3xl font-semibold">
                    $
                    {stats.totalRevenue.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                  <span className="p-1.5 hover:drop-shadow-xl cursor-pointer rounded-full text-white bg-green-400 ml-3 text-xs">
                    Total
                  </span>
                </p>
                <p className="text-gray-500 mt-1">Pending Revenue</p>
              </div>
              <div>
                <p className="text-2xl font-semibold">{stats.totalUsers}</p>
                <p className="text-gray-500 mt-1">Registered Users</p>
              </div>
            </div>
            <div className="flex-1 min-w-[300px]">
              <Stacked currentMode={currentMode} width="100%" height="300px" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg m-3 p-6 rounded-2xl md:w-96">
          <div className="mb-6">
            <p className="font-semibold text-xl">Quick Summary</p>
            <p className="text-gray-500 text-sm">Request overview</p>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <span className="text-blue-600 dark:text-blue-300 font-medium">
                Shipping Requests
              </span>
              <span className="bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-sm font-bold">
                {stats.shipping}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <span className="text-yellow-600 dark:text-yellow-300 font-medium">
                Pending Reviews
              </span>
              <span className="bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded text-sm font-bold">
                {stats.pending}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <span className="text-green-600 dark:text-green-300 font-medium">
                In Progress
              </span>
              <span className="bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 px-2 py-1 rounded text-sm font-bold">
                {stats.inProgress}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <span className="text-orange-600 dark:text-orange-300 font-medium">
                Objections
              </span>
              <span className="bg-orange-100 dark:bg-orange-800 text-orange-800 dark:text-orange-200 px-2 py-1 rounded text-sm font-bold">
                {stats.objection}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
