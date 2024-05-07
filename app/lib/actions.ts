'use server';

import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {signIn} from "@/auth";
import {AuthError} from "next-auth";
import {PutObjectCommand, S3Client} from "@aws-sdk/client-s3";
import {getSignedUrl} from "@aws-sdk/s3-request-presigner";
import {s3Credentials} from "@/app/lib/config";
import axios from "axios";

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: 'Please select a customer.',
  }),
  amount: z.coerce
      .number()
      .gt(0, { message: 'Please enter an amount greater than $0.' }),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select an invoice status.',
  }),
  date: z.string(),
});


const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};
export async function createInvoice(prevState: State, formData: FormData) {
  // Validate form fields using Zod
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('reqImage'),
  });

  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }

  // Prepare data for insertion into the database
  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];

  try {
    await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
  } catch (error) {
    return {
      message: 'Database Error: Failed to Create Invoice.',
    };
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function updateInvoice(id: string, prevState: State, formData: FormData) {
  // Validate form fields using Zod
  const validatedFields = UpdateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Invoice.',
    };
  }

  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;

  try {
    await sql`
        UPDATE invoices
        SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
        WHERE id = ${id}
      `;
  } catch (error) {
    return { message: 'Database Error: Failed to Update Invoice.' };
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
  try {
    await sql`DELETE FROM invoices WHERE id = ${id}`;
    revalidatePath('/dashboard/invoices');
    return { message: 'Deleted Invoice.' };
  } catch (error) {
    return { message: 'Database Error: Failed to Delete Invoice.' };
  }
}


export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}

const REGION = "ap-northeast-2";
const BUCKET = "deca-upload-stage-public";
const ACCESS_KEY = s3Credentials.S3_ACCESS_KEY as string;
const SECRET_KEY = s3Credentials.S3_SECRET_KEY as string;

export const createPresignedUrlWithClient = (key: string) => {
  const client = new S3Client({ region: REGION ,
    credentials:{
      accessKeyId:ACCESS_KEY,
      secretAccessKey:SECRET_KEY
    },
  });
  const command = new PutObjectCommand({ Bucket: BUCKET, Key: key });
  return getSignedUrl(client, command, { expiresIn: 3600 });
};
export const uploadFileToS3 = async (file: File, url: string) => {
  const res = await axios.put(url, file, {
    headers: {
      'Content-Type': file.type,
    },
  })
}

export interface StableImg2ImgRequest {
  prompt: string;
  negative_prompt: string;
  styles: string[];
  seed: number;
  subseed: number;
  subseed_strength: number;
  seed_resize_from_h: number;
  seed_resize_from_w: number;
  sampler_name: string;
  batch_size: number;
  n_iter: number;
  steps: number;
  cfg_scale: number;
  width: number;
  height: number;
  restore_faces: boolean;
  tiling: boolean;
  do_not_save_samples: boolean;
  do_not_save_grid: boolean;
  eta: number;
  denoising_strength: number;
  s_min_uncond: number;
  s_churn: number;
  s_tmax: number;
  s_tmin: number;
  s_noise: number;
  override_settings: object;
  override_settings_restore_afterwards: boolean;
  refiner_checkpoint: string;
  refiner_switch_at: number;
  disable_extra_networks: boolean;
  firstpass_image: string;
  comments: object;
  init_images: string[];
  resize_mode: number;
  image_cfg_scale: number;
  mask: string;
  mask_blur_x: number;
  mask_blur_y: number;
  mask_blur: number;
  mask_round: boolean;
  inpainting_fill: number;
  inpaint_full_res: boolean;
  inpaint_full_res_padding: number;
  inpainting_mask_invert: number;
  initial_noise_multiplier: number;
  latent_mask: string;
  force_task_id: string;
  sampler_index: string;
  include_init_images: boolean;
  script_name: string;
  script_args: any[];
  send_images: boolean;
  save_images: boolean;
  alwayson_scripts: object;
  infotext: string;
}

export const getDefaultStableImg2ImgValue = () => {
  return {
    prompt: "",
    negative_prompt: "",
    styles: [],
    seed: -1,
    subseed: -1,
    subseed_strength: 0,
    seed_resize_from_h: -1,
    seed_resize_from_w: -1,
    sampler_name: "",
    batch_size: 1,
    n_iter: 1,
    steps: 40,
    cfg_scale: 7,
    width: 512,
    height: 512,
    restore_faces: true,
    tiling: true,
    do_not_save_samples: false,
    do_not_save_grid: false,
    eta: 0,
    denoising_strength: 0.75,
    s_min_uncond: 0,
    s_churn: 0,
    s_tmax: 0,
    s_tmin: 0,
    s_noise: 0,
    override_settings: {},
    override_settings_restore_afterwards: true,
    refiner_checkpoint: "",
    refiner_switch_at: 0,
    disable_extra_networks: false,
    firstpass_image: "",
    comments: {},
    init_images: [],
    resize_mode: 0,
    image_cfg_scale: 0,
    mask: "",
    mask_blur_x: 4,
    mask_blur_y: 4,
    mask_blur: 0,
    mask_round: true,
    inpainting_fill: 0,
    inpaint_full_res: true,
    inpaint_full_res_padding: 0,
    inpainting_mask_invert: 0,
    initial_noise_multiplier: 0,
    latent_mask: "",
    force_task_id: "",
    sampler_index: "Euler",
    include_init_images: false,
    script_name: "",
    script_args: [],
    send_images: true,
    save_images: false,
    alwayson_scripts: {},
    infotext: "",
  } as StableImg2ImgRequest
}

export const stableImg2Img = async (body: any) => {
  let request = getDefaultStableImg2ImgValue();
  request = {
    ...request,
    ...body
  }

  console.log('request', request);
  const res = await axios.post('https://sd.devken.kr/sdapi/v1/img2img', request, {
    headers: {
      'Content-Type': 'application/json',
    },
  })
  console.log('res', res);
  return res;

}
