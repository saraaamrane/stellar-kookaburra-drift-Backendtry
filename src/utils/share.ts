import { ProjectData } from '@/types/assessment';

/**
 * Encodes project data into a base64 string for URL sharing
 */
export const encodeProjectData = (data: ProjectData): string => {
  try {
    const jsonString = JSON.stringify(data);
    // Using btoa for simple base64 encoding. 
    // For production, consider a more robust compression like pako/zlib if data gets very large.
    return btoa(encodeURIComponent(jsonString));
  } catch (error) {
    console.error("Failed to encode project data:", error);
    return "";
  }
};

/**
 * Decodes project data from a base64 string
 */
export const decodeProjectData = (encodedData: string): ProjectData | null => {
  try {
    const jsonString = decodeURIComponent(atob(encodedData));
    return JSON.parse(jsonString) as ProjectData;
  } catch (error) {
    console.error("Failed to decode project data:", error);
    return null;
  }
};

/**
 * Generates a full shareable URL
 */
export const getShareableLink = (data: ProjectData): string => {
  const encoded = encodeProjectData(data);
  const url = new URL(window.location.href);
  url.searchParams.set('data', encoded);
  return url.toString();
};