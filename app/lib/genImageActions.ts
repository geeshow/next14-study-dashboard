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
    invalid_type_error: 'Please upload the required image.',
  }),
  status: z.string(),
});


const CreateGenImage = FormSchema.omit({});
const UpdateGenImage = FormSchema.omit({});

export type State = {
  errors?: {
    category?: string[];
    purpose?: string[];
    reqImage?: string[];
  };
  message?: string | null;
};

export async function createGenImage(prevState: State, formData: FormData) {
  // Validate form fields using Zod
  const validatedFields = CreateGenImage.safeParse({
    userId: formData.get('userId'),
    category: formData.get('category'),
    purpose: formData.get('purpose'),
    reqImage: formData.get('reqImage'),
    status: formData.get('status'),
  });
  
  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }
  
  // Prepare data for insertion into the database
  const { userId, category, purpose, reqImageUrl, status } = validatedFields.data;
  const date = new Date().toISOString().split('T')[0];
  
  try {
    await sql`
      INSERT INTO genimages (userId, category, purpose, reqImageUrl, status, createdAt, updatedAt)
      VALUES (${userId}, ${category}, ${purpose}, ${reqImageUrl}, ${status}, ${date}, ${date})
    `;
  } catch (error) {
    return {
      message: 'Database Error: Failed to Create Invoice.',
    };
  }
  
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

