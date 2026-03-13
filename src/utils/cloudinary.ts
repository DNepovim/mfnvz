import {
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  PUBLIC_CLOUDINARY_CLOUD_NAME,
} from 'astro:env/client'
import cloudinary from 'cloudinary'

type GetCloudinaryImagesOptions = {
  folder: string
  showOnlyPromotion?: boolean
}

export const toOgImageUrl = (url: string): string =>
  url.replace('/upload/', '/upload/c_fill,w_1200,h_630/')

export const getCloudinaryImages = async ({
  folder,
  showOnlyPromotion,
}: GetCloudinaryImagesOptions): Promise<string[]> => {
  try {
    cloudinary.v2.config({
      cloud_name: PUBLIC_CLOUDINARY_CLOUD_NAME,
      api_key: CLOUDINARY_API_KEY,
      api_secret: CLOUDINARY_API_SECRET,
    })

    const result = (await cloudinary.v2.search
      .expression(`folder:${folder}/*${showOnlyPromotion ? 'AND tags:promotion' : ''}`)
      .max_results(500)
      .execute()) as { resources: { public_id: string }[] }

    return result.resources.map((resource: { public_id: string }) => resource.public_id)
  } catch (error: unknown) {
    console.error('Error fetching images from Cloudinary:', error)
    return []
  }
}
