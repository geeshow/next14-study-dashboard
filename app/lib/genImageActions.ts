'use server';

import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {signIn} from "@/auth";
import {AuthError} from "next-auth";
const FormSchema = z.object({
  userId: z.string(),
  category: z.string({
    invalid_type_error: 'Please select a category.',
  }),
  purpose: z.string({
    invalid_type_error: 'Please Enter the purpose of the category.',
  }),
  reqImageUrl: z.string({
    invalid_type_error: 'Please Enter the reqImageUrl.',
  })
});


const CreateGenImage = FormSchema.omit({});
const UpdateGenImage = FormSchema.omit({});

export type State = {
  errors?: {
    category?: string[];
    purpose?: string[];
    reqImageUrl?: string[];
  };
  message?: string | null;
};

export async function createGenImage(prevState: State, formData: FormData) {
  // Validate form fields using Zod
  const validatedFields = CreateGenImage.safeParse({
    userId: formData.get('userId'),
    category: formData.get('category'),
    purpose: formData.get('purpose'),
    reqImageUrl: formData.get('reqImageUrl'),
  });

  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }

  // Prepare data for insertion into the database
  const { userId, category, purpose, reqImageUrl } = validatedFields.data;
  const date = new Date().toISOString().split('T')[0];
  try {
    await sql`
      INSERT INTO genimages (user_id, category, purpose, req_image_url, status, created_at, updated_at)
      VALUES (${userId}, ${category}, ${purpose}, ${reqImageUrl}, 'REQUEST', ${date}, ${date})
    `;
  } catch (error) {
    console.log('reqImageUrl', error)
    return {
      message: 'Database Error: Failed to Generate Image.',
    };
  }

  revalidatePath('/dashboard/genImage');
  redirect('/dashboard/genImage');
}

