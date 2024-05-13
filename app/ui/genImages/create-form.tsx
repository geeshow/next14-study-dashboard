'use client'
import {CategoriesTable} from '@/app/lib/definitions';
import Link from 'next/link';
import {ComputerDesktopIcon, PencilIcon,} from '@heroicons/react/24/outline';
import {Button} from '@/app/ui/button';
import {createGenImage} from '@/app/lib/genImageActions';
import {useFormState} from 'react-dom';
import {FileUploader} from "react-drag-drop-files";
import {Suspense, useCallback, useState} from "react";
import {v4 as uuidv4} from "uuid";
import Image from "next/image";
import {createPresignedUrlWithClient,} from "@/app/lib/actions";
import axios from "axios";
import {ImageSkeleton} from "@/app/ui/skeletons";
import CreateImage from "@/app/ui/genImages/create-image";

const fileTypes = ["JPEG", "JPG", "PNG", "GIF", "WEBP"];

export default function Form({ categories }: { categories: CategoriesTable[] }) {
  const initialState = { message: null, errors: {} };
  const [state, dispatch] = useFormState(createGenImage, initialState);
  const [uploadFileUrl, setUploadFileUrl] = useState<string>('');
  const [genImageUrls, setGenImageUrls] = useState<string[]>([]);
  const [category, setCategory] = useState<CategoriesTable|undefined>(undefined);
  const [imageId, setImageId] = useState(uuidv4());

  const handleChange = useCallback(async (selectedFile: File) => {
    const filePath = `gen-image/${imageId}_${selectedFile.name}`
    await uploadFileToS3(selectedFile, filePath);
    setUploadFileUrl(`https://deca-upload-stage-public.s3.ap-northeast-2.amazonaws.com/${filePath}`);
  }, [imageId, setUploadFileUrl])
  
  const uploadFileToS3 = async (file: File,filePath: string) => {
    console.log('url',filePath, file, file.type)
    const url = await createPresignedUrlWithClient(filePath)
    await axios.put(url, file, {
      headers: {
        'Content-Type': file.type,
      },
    })
  }

  const selectCategory = useCallback(async (e: any) => {
    const target = e.target as HTMLSelectElement;
    const category = target.value;
    // find in categories
    const selectedCategory = categories.find((c) => c.name === category);
    setCategory(selectedCategory);
  }, [categories])
  
  return (
      <div>
        <div className="mb-4">
          <label htmlFor="purpose" className="mb-2 block text-sm font-medium">
            Upload your image
          </label>
          <div className="relative mt-2 rounded-md">
            <div className="relative">
              {
                uploadFileUrl !== ''
                    ? (
                        <div className="relative flex">
                          <Image src={uploadFileUrl} alt="image" className="w-1/2" width='240' height='240'/>
                        </div>
                    )
                    : (
                        <FileUploader name="file"
                                      multiple={false} handleChange={handleChange}
                                      types={fileTypes} style={{height: '200px'}}
                        />
                    )
              }
            </div>
          </div>
        </div>
        <form action={dispatch}>
          <input type='hidden' name='userId' value='3958dc9e-712f-4377-85e9-fec4b6a6442a'/>
          <input type='hidden' name='reqImageUrl' value={uploadFileUrl}/>
          
          <div className="rounded-md bg-gray-50 p-4 md:p-6">
            {/* Customer Name */}
            <div className="mb-4">
              <label htmlFor="category" className="mb-2 block text-sm font-medium">
                Choose category
              </label>
              <div className="relative">
                <select
                    id="category"
                    name="category"
                    className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                    defaultValue=""
                    aria-describedby="category-error"
                    onChange={(e) => selectCategory(e)}
                >
                  <option value="" disabled>
                    Select a category
                  </option>
                  {categories.map((category) => (
                      <option key={category.name} value={category.name}>
                        {category.name}
                      </option>
                  ))}
                </select>
                <ComputerDesktopIcon
                    className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500"/>
              </div>
              <div id="category-error" aria-live="polite" aria-atomic="true">
                {state.errors?.category &&
                    state.errors.category.map((error: string) => (
                        <p className="mt-2 text-sm text-red-500" key={error}>
                          {error}
                        </p>
                    ))}
              </div>
            </div>
            
            {/* Invoice Amount */}
            <div className="mb-4">
              <label htmlFor="purpose" className="mb-2 block text-sm font-medium">
                Input the purpose of the category
              </label>
              <div className="relative mt-2 rounded-md">
                <div className="relative">
                  <input
                      id="purpose"
                      name="purpose"
                      type="text"
                      step="0.01"
                      placeholder="Enter the purpose of the category"
                      className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                      aria-describedby="purpose-error"
                  />
                  <PencilIcon
                      className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900"/>
                </div>
              </div>
              <div id="purpose-error" aria-live="polite" aria-atomic="true">
                {state.errors?.purpose &&
                    state.errors.purpose.map((error: string) => (
                        <p className="mt-2 text-sm text-red-500" key={error}>
                          {error}
                        </p>
                    ))}
              </div>
            </div>
          </div>
          <div className="flex justify-between">
            <div className="mt-6 flex gap-4">
              <Button type="button" onClick={(e) => alert(1)}>Generate</Button>
            </div>
            <div className="mt-6 flex gap-4">
              <Link
                  href="/dashboard/invoices"
                  className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
              >
                Cancel
              </Link>
              <Button type="submit">Save</Button>
            </div>
          </div>
        </form>
        <div className="mb-4">
          <div className="relative mt-2 rounded-md">
            <div className="relative flex">
              {
                genImageUrls.map(url => {
                  return (
                      <Image key={url} src={url} alt="image" className="w-1/4" width='240' height='240'/>
                  )
                })
              }
            </div>
            { category && (
              <CreateImage uploadImageUrl={uploadFileUrl} imageId={imageId} category={category}/>
            )}
          </div>
        </div>
      </div>
  )
      ;
}
