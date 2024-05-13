import Image from "next/image";
import {useEffect, useState} from "react";
import {sdRequest} from "@/app/lib/actions-stablediffusion";
import {CategoriesTable} from "@/app/lib/definitions";
import {ImageSkeleton} from "@/app/ui/skeletons";

export default function CreateImage({ uploadImageUrl, imageId, category }: { uploadImageUrl: string, imageId: string, category: CategoriesTable }) {
  const [loading, setLoading] = useState(false);
  const [genImageUrls, setGenImageUrls] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const res = await sdRequest(uploadImageUrl, imageId, category);
      setGenImageUrls([...genImageUrls, res.imageUrl]);
      // setGenImageUrls([...genImageUrls, res.frameImageUrl, res.imageUrl]);
      setLoading(false);
    };

    fetchData();
  }, [uploadImageUrl, imageId, category]);

  return (
      <div className="relative flex">
        { loading && <ImageSkeleton /> }
        { loading && <ImageSkeleton /> }
        {
          genImageUrls.map(url => {
            return (
                <Image key={url} src={url} alt="image" className="w-1/4" width='240' height='240'/>
            )
          })
        }
      </div>
  )
}
