import { Course } from "../models/coursemodel.js";
import { Lecture } from "../models/lecturemodel.js";
import { deleteMediaFromCloudinary, deleteVideoFromCloudinary, uploadMedia, extractPublicIdFromUrl } from "../utils/cloudinary.js";

export const createCourse = async (req, res) => {
  try {
    const { courseTitle, category } = req.body;
    const thumbnail = req.file;

    if (!req.id) {
      return res.status(401).json({ message: "Unauthorized: User ID missing", success: false });
    }

    if (!courseTitle || !category) {
      return res.status(400).json({ message: "Course title and category are required.", success: false });
    }

    let courseThumbnail;
    if (thumbnail) {
      // Confirm multer file path usage
      const filePath = thumbnail.path || thumbnail.buffer || null;
      if (!filePath) {
        return res.status(400).json({ message: "Invalid thumbnail file", success: false });
      }
      const uploadResponse = await uploadMedia(filePath);
      courseThumbnail = uploadResponse.secure_url;
    }

    const course = await Course.create({ courseTitle, category, creator: req.id, courseThumbnail });
    return res.status(201).json({ course, message: "Course created successfully.", success: true });
  } catch (error) {
    console.error("Error in createCourse:", error);
    return res.status(500).json({ message: "Failed to create course", success: false });
  }
};

export const searchCourse = async (req, res) => {
  try {
    const { query = "", categories = [], sortByPrice = "" } = req.query;
    const searchCriteria = {
      isPublished: true,
      $or: [
        { courseTitle: { $regex: query, $options: "i" } },
        { subTitle: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } },
      ],
    };
    if (Array.isArray(categories) && categories.length > 0) {
      searchCriteria.category = { $in: categories };
    }
    const sortOptions = {};
    if (sortByPrice === "low") sortOptions.coursePrice = 1;
    else if (sortByPrice === "high") sortOptions.coursePrice = -1;
    const courses = await Course.find(searchCriteria).populate({ path: "creator", select: "name photoUrl" }).sort(sortOptions);
    return res.status(200).json({ success: true, courses: courses || [] });
  } catch (error) {
    console.error("Error in searchCourse:", error);
    return res.status(500).json({ message: "Failed to search courses", success: false });
  }
};

export const getPublishedCourse = async (_, res) => {
  try {
    const courses = await Course.find({ isPublished: true }).populate({ path: "creator", select: "name photoUrl" });
    return res.status(200).json({ success: true, courses: courses || [] });
  } catch (error) {
    console.error("Error in getPublishedCourse:", error);
    return res.status(500).json({ message: "Failed to get published courses", success: false });
  }
};

export const getCreatorCourses = async (req, res) => {
  try {
    if (!req.id) {
      return res.status(401).json({ message: "Unauthorized: User ID missing", success: false });
    }
    const userId = req.id;
    const courses = await Course.find({ creator: userId });
    if (!courses || courses.length === 0) {
      return res.status(404).json({ courses: [], message: "No courses found for this creator", success: false });
    }
    return res.status(200).json({ success: true, courses });
  } catch (error) {
    console.error("Error in getCreatorCourses:", error);
    return res.status(500).json({ message: "Failed to get creator courses", success: false });
  }
};

export const editCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const { courseTitle, subTitle, description, category, courseLevel, coursePrice } = req.body;
    const thumbnail = req.file;
    let course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found!", success: false });
    let courseThumbnail;
    if (thumbnail) {
      if (course.courseThumbnail) {
        const publicId = extractPublicIdFromUrl(course.courseThumbnail);
        if (publicId) {
          await deleteMediaFromCloudinary(publicId);
        }
      }
      const filePath = thumbnail.path || thumbnail.buffer || null;
      if (!filePath) {
        return res.status(400).json({ message: "Invalid thumbnail file", success: false });
      }
      const uploadResponse = await uploadMedia(filePath);
      courseThumbnail = uploadResponse.secure_url;
    }
    const updateData = { courseTitle, subTitle, description, category, courseLevel, coursePrice, courseThumbnail: courseThumbnail || course.courseThumbnail };
    course = await Course.findByIdAndUpdate(courseId, updateData, { new: true });
    return res.status(200).json({ success: true, course, message: "Course updated successfully." });
  } catch (error) {
    console.error("Error in editCourse:", error);
    return res.status(500).json({ message: "Failed to update course", success: false });
  }
};

export const getCourseById = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found!", success: false });
    return res.status(200).json({ success: true, course });
  } catch (error) {
    console.error("Error in getCourseById:", error);
    return res.status(500).json({ message: "Failed to get course by id", success: false });
  }
};

export const createLecture = async (req, res) => {
  try {
    const { lectureTitle } = req.body;
    const { courseId } = req.params;
    if (!lectureTitle || !courseId) return res.status(400).json({ message: "Lecture title and course ID are required", success: false });
    const lecture = await Lecture.create({ lectureTitle });
    const course = await Course.findById(courseId);
    if (course && !course.lectures.includes(lecture._id)) {
      course.lectures.push(lecture._id);
      await course.save();
    }
    return res.status(201).json({ success: true, lecture, message: "Lecture created successfully." });
  } catch (error) {
    console.error("Error in createLecture:", error);
    return res.status(500).json({ message: "Failed to create lecture", success: false });
  }
};

export const getCourseLecture = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId).populate("lectures");
    if (!course) return res.status(404).json({ message: "Course not found", success: false });
    return res.status(200).json({ success: true, lectures: course.lectures });
  } catch (error) {
    console.error("Error in getCourseLecture:", error);
    return res.status(500).json({ message: "Failed to get lectures", success: false });
  }
};

export const editLecture = async (req, res) => {
  try {
    const { lectureTitle, videoInfo, isPreviewFree } = req.body;
    const { courseId, lectureId } = req.params;
    const lecture = await Lecture.findById(lectureId);
    if (!lecture) return res.status(404).json({ message: "Lecture not found!", success: false });
    if (lectureTitle) lecture.lectureTitle = lectureTitle;
    if (videoInfo?.videoUrl) lecture.videoUrl = videoInfo.videoUrl;
    if (videoInfo?.publicId) lecture.publicId = videoInfo.publicId;
    lecture.isPreviewFree = isPreviewFree;
    await lecture.save();
    const course = await Course.findById(courseId);
    if (course && !course.lectures.includes(lecture._id)) {
      course.lectures.push(lecture._id);
      await course.save();
    }
    return res.status(200).json({ success: true, lecture, message: "Lecture updated successfully." });
  } catch (error) {
    console.error("Error in editLecture:", error);
    return res.status(500).json({ message: "Failed to edit lectures", success: false });
  }
};

export const removeLecture = async (req, res) => {
  try {
    const { lectureId } = req.params;
    const lecture = await Lecture.findByIdAndDelete(lectureId);
    if (!lecture) return res.status(404).json({ message: "Lecture not found!", success: false });
    if (lecture.publicId) await deleteVideoFromCloudinary(lecture.publicId);
    await Course.updateOne({ lectures: lectureId }, { $pull: { lectures: lectureId } });
    return res.status(200).json({ success: true, message: "Lecture removed successfully." });
  } catch (error) {
    console.error("Error in removeLecture:", error);
    return res.status(500).json({ message: "Failed to remove lecture", success: false });
  }
};

export const getLectureById = async (req, res) => {
  try {
    const { lectureId } = req.params;
    const lecture = await Lecture.findById(lectureId);
    if (!lecture) return res.status(404).json({ message: "Lecture not found!", success: false });
    return res.status(200).json({ success: true, lecture });
  } catch (error) {
    console.error("Error in getLectureById:", error);
    return res.status(500).json({ message: "Failed to get lecture by id", success: false });
  }
};

export const togglePublishCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { publish } = req.query;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found!", success: false });
    course.isPublished = publish === "true";
    await course.save();
    const statusMessage = course.isPublished ? "Published" : "Unpublished";
    return res.status(200).json({ success: true, message: `Course is ${statusMessage}` });
  } catch (error) {
    console.error("Error in togglePublishCourse:", error);
    return res.status(500).json({ message: "Failed to update status", success: false });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findByIdAndDelete(courseId);
    if (!course) return res.status(404).json({ message: "Course not found!", success: false });
    if (course.courseThumbnail) {
      const publicId = extractPublicIdFromUrl(course.courseThumbnail);
      if (publicId) {
        await deleteMediaFromCloudinary(publicId);
      }
    }
    return res.status(200).json({ success: true, message: "Course deleted successfully." });
  } catch (error) {
    console.error("Error in deleteCourse:", error);
    return res.status(500).json({ message: "Failed to delete course", success: false });
  }
};
