import Form from '@/app/ui/genImages/create-form';
import Breadcrumbs from '@/app/ui/genImages/breadcrumbs';
import {fetchCategory} from '@/app/lib/data';

export default async function Page() {
  const categoriesTables = await fetchCategory();
  
  return (
      <main>
        <Breadcrumbs
            breadcrumbs={[
              { label: 'Generate Image', href: '/dashboard/genImage' },
              {
                label: 'Create',
                href: '/dashboard/genImage/create',
                active: true,
              },
            ]}
        />
        <Form categories={categoriesTables} />
      </main>
  );
}
