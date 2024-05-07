import Image from 'next/image';
import { UpdateInvoice, DeleteInvoice } from '@/app/ui/invoices/buttons';
import InvoiceStatus from '@/app/ui/invoices/status';
import { formatDateToLocal, formatCurrency } from '@/app/lib/utils';
import {fetchFilteredGenImages, fetchFilteredInvoices} from '@/app/lib/data';

export default async function GenImagesTable({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  const reqGenImages = await fetchFilteredGenImages(query, currentPage);
  console.log('reqGenImages', reqGenImages)

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
            <tr>
              <th scope="col" className="px-3 py-5 font-medium">
                Category
              </th>
              <th scope="col" className="px-3 py-5 font-medium">
                Purpose
              </th>
              <th scope="col" className="px-3 py-5 font-medium">
                Requested At
              </th>
              <th scope="col" className="px-3 py-5 font-medium">
                Uploaded Image
              </th>
              <th scope="col" className="px-3 py-5 font-medium">
                Generated Image
              </th>
              <th scope="col" className="relative py-3 pl-6 pr-3">
                <span className="sr-only">Edit</span>
              </th>
            </tr>
            </thead>
            <tbody className="bg-white">
            {reqGenImages?.map((genImage) => (
              <tr
                key={genImage.id}
                className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
              >
                <td className="whitespace-nowrap px-3 py-3">
                  {genImage.category}
                </td>
                <td className="whitespace-nowrap px-3 py-3">
                  {genImage.purpose}
                </td>
                <td className="whitespace-nowrap px-3 py-3">
                  {formatDateToLocal(genImage.created_at)}
                </td>
                <td className="whitespace-nowrap px-3 py-3">
                  <Image
                    src={genImage.req_image_url}
                    className="mr-2 rounded-full"
                    width={80}
                    height={80}
                    alt={`${genImage.category} ${genImage.purpose}`}
                  />
                </td>
                <td className="whitespace-nowrap px-3 py-3 relative">
                  {genImage.gen_image_urls?.split(',').map((url) => (
                    <Image
                      key={url}
                      src={url}
                      className="absolute top-2 left-0 mr-2 rounded-full border"
                      width={80}
                      height={80}
                      alt={`${genImage.category} ${genImage.purpose}`}
                    />
                  ))}
                </td>
                <td className="whitespace-nowrap py-3 pl-6 pr-3">
                  <div className="flex justify-end gap-3">
                    <UpdateInvoice id={genImage.id}/>
                    <DeleteInvoice id={genImage.id}/>
                  </div>
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
