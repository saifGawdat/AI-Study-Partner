import apiClient from "./apiClient";

export interface ExtractedSubject {
  name: string;
  description: string;
  chapters: {
    name: string;
    topics: {
      name: string;
    }[];
  }[];
}

export const extractBookStructure = async (
  file: File,
): Promise<ExtractedSubject> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.post("/ai/extract-book", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const generateSchedule = async (
  subjects: string[],
): Promise<{ schedule: string }> => {
  const response = await apiClient.post("/ai/generate-schedule", {
    subjects,
  });
  return response.data;
};
