import cloudinary from "cloudinary";

type GetCloudinaryImagesOptions = {
  folder: string;
  showOnlyPromotion?: boolean;
};

export const getCloudinaryImages = async ({
  folder,
  showOnlyPromotion,
}: GetCloudinaryImagesOptions): Promise<string[]> => {
  const cloudName = import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME as string;
  const apiKey = import.meta.env.PUBLIC_CLOUDINARY_API_KEY as string | undefined;
  const apiSecret = import.meta.env.CLOUDINARY_API_SECRET as string | undefined;

  if (!apiKey || !apiSecret) {
    console.warn(
      "Cloudinary API credentials not found. Please provide imageIds prop or set PUBLIC_CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET",
    );
    return [];
  }

  try {
    cloudinary.v2.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });

    const result = (await cloudinary.v2.search
      .expression(
        `folder:${folder}/*${showOnlyPromotion ? "AND tags:promotion" : ""}`,
      )
      .max_results(500)
      .execute()) as { resources: { public_id: string }[] };

    return result.resources.map(
      (resource: { public_id: string }) => resource.public_id,
    );
  } catch (error: unknown) {
    console.error("Error fetching images from Cloudinary:", error);
    return [];
  }
};
