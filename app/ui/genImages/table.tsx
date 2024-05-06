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

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                  Customer
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Email
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Amount
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Date
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Status
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
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center gap-3">
                      <Image
                        src={genImage.image_url}
                        className="rounded-full"
                        width={28}
                        height={28}
                        alt={`${genImage.name}'s profile picture`}
                      />
                      <p>{genImage.name}</p>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {genImage.email}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <Image
                        src={genImage.reqImageUrl}
                        className="mr-2 rounded-full"
                        width={40}
                        height={40}
                        alt={`${genImage.category} ${genImage.purpose}`}
                    />
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {formatDateToLocal(genImage.createdAt)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <InvoiceStatus status={genImage.status} />
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex justify-end gap-3">
                      <UpdateInvoice id={genImage.id} />
                      <DeleteInvoice id={genImage.id} />
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
