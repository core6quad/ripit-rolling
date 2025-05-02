// import { parse } from "path";

// export function parseResolutions(output) {
//   const lines = output.split('\n');
//   const videoFormats = [];
//   const audioFormats = [];
//   let isHeaderPassed = false;

//   lines.forEach((line) => {
//     if (line.includes('ID') && line.includes('RESOLUTION')) {
//       isHeaderPassed = true;
//       return;
//     }

//     if (!isHeaderPassed) return;

//     const match = line.match(/^\s*(\S+)\s+(\S+)\s+(\d+x\d+|\d+p|\d+k|audio only)?\s+(.*?)\s+(\S+)?$/);
//     if (match) {
//       const format = match[1];
//       const extension = match[2];
//       const resolution = match[3] || 'Unknown';
//       const description = match[4] || '';
//       const size = match[5] || 'Unknown';

//       if (resolution === 'audio only' && extension === 'm4a') {
//         audioFormats.push({ format, extension, resolution, description, size });
//       } else if (resolution !== 'audio only' &&
//         extension === 'mp4' &&
//         description.includes('avc1')) {  // Only H.264/AVC video codec
//         videoFormats.push({ format, extension, resolution, size });
//       }
//     }
//   });

//   // Sort video formats by quality (assuming resolution format like "1080p", "720p", etc.)
//   videoFormats.sort((a, b) => {
//     const getPixels = (res) => parseInt(res.resolution.match(/\d+/)[0]);
//     return getPixels(b) - getPixels(a);
//   });

//   return { videoFormats, audioFormats };
// }