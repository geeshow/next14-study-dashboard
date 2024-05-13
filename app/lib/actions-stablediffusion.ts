'use server';

import axios from "axios";
import {createPresignedUrlWithClient} from "@/app/lib/actions";
import {v4 as uuidv4} from "uuid";
import {CategoriesTable} from "@/app/lib/definitions";
const fs = require('fs');

export interface StableTxt2ImgRequest {
  prompt: string;
  negative_prompt: string;
  // styles: string[];
  seed: number;
  sampler_name: string;
  batch_size: number;
  n_iter: number;
  steps: number;
  cfg_scale: number;
  width: number;
  height: number;
  alwayson_scripts: {
    controlnet: {
      args: any[]
    }
  }
}

export interface StableImg2ImgRequest {
  prompt: string;
  negative_prompt: string;
  // styles: string[];
  seed: number;
  subseed: number;
  subseed_strength: number;
  seed_resize_from_h: number;
  seed_resize_from_w: number;
  // sampler_name: string;
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
  // refiner_checkpoint: string;
  refiner_switch_at: number;
  disable_extra_networks: boolean;
  // firstpass_image: string;
  comments: object;
  init_images: string[];
  resize_mode: number;
  image_cfg_scale: number;
  // mask: string;
  mask_blur_x: number;
  mask_blur_y: number;
  mask_blur: number;
  mask_round: boolean;
  inpainting_fill: number;
  inpaint_full_res: boolean;
  inpaint_full_res_padding: number;
  inpainting_mask_invert: number;
  initial_noise_multiplier: number;
  // latent_mask: string;
  // force_task_id: string;
  // sampler_index: string;
  include_init_images: boolean;
  // script_name: string;
  script_args: any[];
  send_images: boolean;
  save_images: boolean;
  alwayson_scripts: object;
  // infotext: string;
}
export const getDefaultStableTxt2ImgValue = () => {
  return {
    prompt: "",
    negative_prompt: "",
    // styles: [],
    seed: -1,
    sampler_name: "",
    batch_size: 1,
    n_iter: 1,
    steps: 40,
    cfg_scale: 7,
    width: 512,
    height: 512,
    alwayson_scripts: {
      controlnet: {
        args: [
          {
            "enabled": true,
            "module": "canny",
            "model": "control_v11p_sd15_canny_fp16 [b18e0966]",
            "weight": 1.0,
            "image":  "",
            "resize_mode": 1,
            "lowvram": false,
            "processor_res": 256,
            "threshold_a": 100,
            "threshold_b": 200,
            "guidance_start": 0.0,
            "guidance_end": 1.0,
            "control_mode": 0,
            "pixel_perfect": false
          }
        ]
      }
    }
  } as StableTxt2ImgRequest
}

export const getDefaultStableImg2ImgValue = () => {
  return {
    prompt: "",
    negative_prompt: "",
    // styles: [],
    seed: -1,
    subseed: -1,
    subseed_strength: 0,
    seed_resize_from_h: -1,
    seed_resize_from_w: -1,
    // sampler_name: "",
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
    // refiner_checkpoint: "",
    refiner_switch_at: 0,
    disable_extra_networks: false,
    // firstpass_image: "",
    comments: {},
    init_images: [],
    resize_mode: 0,
    image_cfg_scale: 0,
    // mask: "",
    mask_blur_x: 4,
    mask_blur_y: 4,
    mask_blur: 0,
    mask_round: true,
    inpainting_fill: 0,
    inpaint_full_res: true,
    inpaint_full_res_padding: 0,
    inpainting_mask_invert: 0,
    initial_noise_multiplier: 0,
    // latent_mask: "",
    // force_task_id: "",
    // sampler_index: "Euler",
    include_init_images: false,
    // script_name: "",
    script_args: [],
    send_images: true,
    save_images: true,
    alwayson_scripts: {
      controlnet: {
        args: [
          {
            "enabled": true,
            "module": "canny",
            "model": "control_v11p_sd15_canny_fp16 [b18e0966]",
            "weight": 1.0,
            "image":  "",
            "resize_mode": 1,
            "lowvram": false,
            "processor_res": 256,
            "threshold_a": 100,
            "threshold_b": 200,
            "guidance_start": 0.0,
            "guidance_end": 1.0,
            "control_mode": 0,
            "pixel_perfect": false
          }
        ]
      }
    },
    // infotext: "",
  } as StableImg2ImgRequest
}
export interface StableTxt2ImgRequest {
  baseImage: string;
  controlnet: any;
}
export const stableTxt2Img = async (imageId: string, body: any, req: StableTxt2ImgRequest) => {
  imageId = imageId + '_' + uuidv4();
  let request = getDefaultStableTxt2ImgValue();
  request = {
    ...request,
    ...body
  }
  request.alwayson_scripts.controlnet.args[0].image = req.baseImage;
  request.alwayson_scripts.controlnet.args[0] = {
    ...request.alwayson_scripts.controlnet.args[0],
    ...req.controlnet
  };
  
  const response = await fetch('https://sd.devken.kr/sdapi/v1/txt2img', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })
  const res = await response.json();
  console.log('res', res);
  
  // 예제: Base64 문자열과 파일 이름을 이용하여 File 객체 생성
  const genImageFileName = `${imageId}_gen.png`;
  await uploadBase64ToS3(res.images[0], genImageFileName, "image/png", `gen-image/${genImageFileName}`);
  
  const frameImageFileName = `${imageId}_${req.controlnet.module}.png`;
  await uploadBase64ToS3(res.images[1], frameImageFileName, "image/png",`gen-image/${frameImageFileName}`);
  
  return {
    imageUrl: `https://deca-upload-stage-public.s3.ap-northeast-2.amazonaws.com/gen-image/${genImageFileName}`,
    frameImageUrl: `https://deca-upload-stage-public.s3.ap-northeast-2.amazonaws.com/gen-image/${frameImageFileName}`,
  };
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


/**
 * Base64 문자열을 JavaScript File 객체로 변환
 * @param {string} base64String Base64 문자열
 * @param {string} fileName 파일 이름
 * @param {string} mimeType MIME 타입 (옵션)
 * @returns {File} 변환된 File 객체
 */
function base64StringToFile(base64String: string, fileName: string): void {
  // Base64를 디코딩하여 바이너리 데이터로 변환
}

const uploadBase64ToS3 = async (base64String: string, fileName: string, contentType: string, filePath: string) => {
  console.log('url',filePath, fileName, contentType)

  const buffer = Buffer.from(base64String, 'base64');
  
  const url = await createPresignedUrlWithClient(filePath)
  const res = await axios.put(url, buffer, {
    headers: {
      'Content-Type': contentType
    },
    responseType: 'arraybuffer', // 응답을 ArrayBuffer로 받습니다.
  });
  
  // const blob = new Blob([buffer], { type: contentType });
  // let formData = new FormData();
  // formData.append('file', blob, fileName);
  // const res = await axios.put(url, formData, {
  //   headers: {
  //     'Content-Type': contentType,
  //   },
  // })
  console.log('res', res.request);
}


export const sdRequest = async (uploadImageUrl: string, imageId: string, category: CategoriesTable) => {
  let sdReq = category?.options as {};
  sdReq = {
    ...sdReq,
    prompt: category?.prompt || '',
    negative_prompt: category?.negativePrompt || '',
    init_images: [uploadImageUrl]
  }
  
  const sdOptions = {
    baseImage: uploadImageUrl,
    controlnet: {
      "module": "canny",
      "model": "control_v11p_sd15_canny_fp16 [b18e0966]",
      "threshold_a": 100,
      "threshold_b": 200,
    }
  } as StableTxt2ImgRequest
  
  const result = await stableTxt2Img(imageId, sdReq, sdOptions)
  return {
    imageUrl: result.imageUrl,
    frameImageUrl: result.frameImageUrl,
  }
}
