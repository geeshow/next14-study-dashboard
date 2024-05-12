'use server';

import axios from "axios";

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
export const stableTxt2Img = async (body: any, req: StableTxt2ImgRequest) => {
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
  
  console.log('request', request);
  const res = await axios.post('https://sd.devken.kr/sdapi/v1/txt2img', request, {
    headers: {
      'Content-Type': 'application/json',
    },
  })
  console.log('res', res);
  return res;
  
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
