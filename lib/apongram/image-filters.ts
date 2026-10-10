import { fromByteArray } from "base64-js";
import * as FileSystem from "expo-file-system/legacy";
import { Platform } from "react-native";
import jpeg from "jpeg-js";

export type ImageFilter = "grayscale" | "brightness" | "contrast";

export async function applyImageFilter(uri: string, filter: ImageFilter): Promise<string> {
  const response = await fetch(uri);
  const input = new Uint8Array(await response.arrayBuffer());
  const decoded = jpeg.decode(input, { useTArray: true });
  const pixels = decoded.data;
  const contrastFactor = 1.45;

  for (let index = 0; index < pixels.length; index += 4) {
    const red = pixels[index];
    const green = pixels[index + 1];
    const blue = pixels[index + 2];
    if (filter === "grayscale") {
      const luminance = Math.round(red * 0.299 + green * 0.587 + blue * 0.114);
      pixels[index] = luminance;
      pixels[index + 1] = luminance;
      pixels[index + 2] = luminance;
    } else if (filter === "brightness") {
      pixels[index] = Math.min(255, red + 35);
      pixels[index + 1] = Math.min(255, green + 35);
      pixels[index + 2] = Math.min(255, blue + 35);
    } else {
      pixels[index] = Math.max(0, Math.min(255, Math.round((red - 128) * contrastFactor + 128)));
      pixels[index + 1] = Math.max(0, Math.min(255, Math.round((green - 128) * contrastFactor + 128)));
      pixels[index + 2] = Math.max(0, Math.min(255, Math.round((blue - 128) * contrastFactor + 128)));
    }
  }

  const encoded = jpeg.encode({ width: decoded.width, height: decoded.height, data: pixels }, 85).data;
  const base64 = fromByteArray(new Uint8Array(encoded));
  if (Platform.OS === "web" || !FileSystem.cacheDirectory) return `data:image/jpeg;base64,${base64}`;
  const outputUri = `${FileSystem.cacheDirectory}ekta-filter-${Date.now()}.jpg`;
  await FileSystem.writeAsStringAsync(outputUri, base64, { encoding: FileSystem.EncodingType.Base64 });
  return outputUri;
}
