import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetPurchasedCoursesQuery } from "@/features/api/purchaseApi";
import React, { useMemo } from "react"; // Added useMemo for performance
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const Dashboard = () => {
  // Fetch data using the RTK Query hook
  const { data, isSuccess, isError, isLoading, error } = useGetPurchasedCoursesQuery();

  // Destructure purchasedCourse data with a default empty array
  // Using optional chaining and nullish coalescing for safety
  const purchasedCourses = data?.purchasedCourse ?? [];

  // Memoize calculations for performance, re-calculating only when purchasedCourses changes
  const { totalSales, totalRevenue, averageRevenuePerSale, uniqueCoursesCount, courseData } = useMemo(() => {
    // Calculate Total Sales
    const totalSales = purchasedCourses.length;

    // Calculate Total Revenue
    // Ensure 'amount' exists and is a number, default to 0 if not
    const totalRevenue = purchasedCourses.reduce((acc, element) => acc + (typeof element.amount === 'number' ? element.amount : 0), 0);

    // Calculate Average Revenue per Sale
    const averageRevenuePerSale = totalSales > 0 ? totalRevenue / totalSales : 0;

    // Calculate Number of Unique Courses Purchased
    const uniqueCourseTitles = new Set(purchasedCourses.map(course => course.courseId?.courseTitle).filter(Boolean)); // Use Set to get unique titles, filter out null/undefined
    const uniqueCoursesCount = uniqueCourseTitles.size;


    // Prepare data for the Course Prices Line Chart
    // Ensure courseId and courseTitle/coursePrice exist before mapping
    const courseData = purchasedCourses
      .filter(course => course.courseId && course.courseId.courseTitle && typeof course.courseId.coursePrice === 'number')
      .map(course => ({
        name: course.courseId.courseTitle,
        price: course.courseId.coursePrice,
      }));


    return {
      totalSales,
      totalRevenue,
      averageRevenuePerSale,
      uniqueCoursesCount,
      courseData,
    };
  }, [purchasedCourses]); // Dependency array for useMemo

  // Currency formatter for INR (Indian Rupees)
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  });

  // Handle loading state
  if (isLoading) {
    return <div className="flex justify-center items-center h-screen text-xl font-semibold text-gray-700">Loading dashboard data...</div>;
  }

  // Handle error state
  if (isError) {
    console.error("Failed to fetch purchased courses:", error); // Log error for debugging
    return <div className="flex justify-center items-center h-screen text-xl font-semibold text-red-500">Error: Failed to load dashboard data.</div>;
  }

  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 ">
      {/* Total Sales Card */}
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-gray-600">Total Sales</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-blue-600">{totalSales}</p>
        </CardContent>
      </Card>

      {/* Total Revenue Card */}
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-gray-600">Total Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-green-600">{formatter.format(totalRevenue)}</p> {/* Formatted as currency */}
        </CardContent>
      </Card>

      {/* Average Revenue per Sale Card */}
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-gray-600">Avg. Revenue per Sale</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-purple-600">{formatter.format(averageRevenuePerSale)}</p> {/* Formatted as currency */}
        </CardContent>
      </Card>

      {/* Unique Courses Purchased Card */}
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-gray-600">Unique Courses</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-orange-600">{uniqueCoursesCount}</p>
        </CardContent>
      </Card>

      {/* Course Prices Chart Card */}
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-700">
            Price per Purchased Course
          </CardTitle>
        </CardHeader>
        <CardContent>
          {courseData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}> {/* Increased height slightly */}
              <LineChart data={courseData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis
                  dataKey="name"
                  stroke="#6b7280"
                  angle={-30} // Rotated labels for better visibility
                  textAnchor="end"
                  interval={0} // Display all labels
                  height={60} // Give more space for rotated labels
                />
                <YAxis stroke="#6b7280" />
                <Tooltip formatter={(value) => [formatter.format(value), 'Price']} /> {/* Format tooltip value */}
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#4a90e2" // Changed color to a different shade of blue
                  strokeWidth={3}
                  dot={{ stroke: "#4a90e2", strokeWidth: 2 }} // Same color for the dot
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex justify-center items-center h-full text-gray-500">
              No course data available to display chart.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;