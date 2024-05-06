'use client';

import {CategoriesTable, CustomerField} from '@/app/lib/definitions';
import Link from 'next/link';
import {
  CheckIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ComputerDesktopIcon, PencilIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/app/ui/button';
import { createGenImage } from '@/app/lib/genImageActions';
import { useFormState } from 'react-dom';
import { FileUploader } from "react-drag-drop-files";
import {useCallback, useState} from "react";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import {getSignedUrl} from "@aws-sdk/s3-request-presigner";
import {v4 as uuidv4} from "uuid";
import Image from "next/image";
import axios from "axios";
import { s3Credentials } from '../../lib/config'

const fileTypes = ["JPEG", "PNG", "GIF"];
const REGION = "ap-northeast-2";
const BUCKET = "deca-upload-stage-public";
const ACCESS_KEY = s3Credentials.S3_ACCESS_KEY as string;
const SECRET_KEY = s3Credentials.S3_SECRET_KEY as string;

export default function Form({ categories }: { categories: CategoriesTable[] }) {
  const initialState = { message: null, errors: {} };
  const [state, dispatch] = useFormState(createGenImage, initialState);
  const [fileUrls, setFileUrls] = useState<string[]>([]);
  
  const handleChange = useCallback(async (files: File[]) => {
    let urls = [];
    for (let i = 0; i < files.length; i++) {
      const key = uuidv4();
      const file = files[i];
      const uploadUrl = `gen-image/${key}${file.name}`
      const url = await createPresignedUrlWithClient(uploadUrl)
      console.log('url', url);
      urls.push(`https://deca-upload-stage-public.s3.ap-northeast-2.amazonaws.com/${uploadUrl}`);
      await uploadFile(file, url);
    }
    setFileUrls(urls);
  }, [setFileUrls])
  
  const uploadFile = async (file: File, url: string) => {
    const res = await axios.put(url, file, {
      headers: {
        'Content-Type': file.type,
      },
    })
    console.log(res)
  }
  
  const createPresignedUrlWithClient = (key: string) => {
    const client = new S3Client({ region: REGION ,
      credentials:{
        accessKeyId:ACCESS_KEY,
        secretAccessKey:SECRET_KEY
      },
    });
    const command = new PutObjectCommand({ Bucket: BUCKET, Key: key });
    return getSignedUrl(client, command, { expiresIn: 3600 });
  };
  
  return (
      <form action={dispatch}>
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
                    type="number"
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
          {/* Invoice Amount */}
          <div className="mb-4">
            <label htmlFor="purpose" className="mb-2 block text-sm font-medium">
              Input the purpose of the category
            </label>
            <div className="relative mt-2 rounded-md">
              <div className="relative">
                <FileUploader
                    multiple={true}
                    handleChange={handleChange}
                    name="file"
                    types={fileTypes}
                />
                {
                  fileUrls.map((url) => {
                    return (
                      <Image
                          key={url}
                          src={url}
                          className="mr-2 rounded-full"
                          width={40}
                          height={40}
                          alt='Uploaded Image'
                      />
                    );
                  })
                }
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
        <div className="mt-6 flex justify-end gap-4">
          <Link
              href="/dashboard/invoices"
              className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
          >
            Cancel
          </Link>
          <Button type="submit">Create Invoice</Button>
        </div>
      </form>
  );
}
