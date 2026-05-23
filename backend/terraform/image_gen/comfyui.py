import json
from typing import Optional
from terraform.config import settings


class ComfyUIIntegration:
    def __init__(self):
        self.enabled = settings.comfyui_enabled
        self.base_url = settings.comfyui_base_url

    async def generate_concept_render(self, description: str, style: str = "landscape architecture") -> Optional[str]:
        if not self.enabled:
            return None
        try:
            import httpx
            prompt_text = f"{style}: {description}, high quality, architectural rendering, cinematic lighting"
            payload = {
                "prompt": {
                    "3": {
                        "class_type": "KSampler",
                        "inputs": {
                            "seed": 42,
                            "steps": 30,
                            "cfg": 7.5,
                            "sampler_name": "euler",
                            "scheduler": "normal",
                            "denoise": 1.0,
                            "model": ["4", 0],
                            "positive": ["6", 0],
                            "negative": ["7", 0],
                            "latent_image": ["5", 0],
                        },
                    },
                    "4": {"class_type": "CheckpointLoaderSimple", "inputs": {"ckpt_name": "sd_xl_base.safetensors"}},
                    "5": {"class_type": "EmptyLatentImage", "inputs": {"width": 1216, "height": 832, "batch_size": 1}},
                    "6": {
                        "class_type": "CLIPTextEncode",
                        "inputs": {"text": prompt_text, "clip": ["4", 1]},
                    },
                    "7": {
                        "class_type": "CLIPTextEncode",
                        "inputs": {"text": "low quality, blurry, distorted, ugly", "clip": ["4", 1]},
                    },
                    "8": {"class_type": "VAEDecode", "inputs": {"samples": ["3", 0], "vae": ["4", 2]}},
                    "9": {
                        "class_type": "SaveImage",
                        "inputs": {"filename_prefix": "terraform_render", "images": ["8", 0]},
                    },
                },
            }
            async with httpx.AsyncClient(timeout=60.0) as client:
                resp = await client.post(f"{self.base_url}/prompt", json=payload)
                return resp.json().get("prompt_id")
        except Exception as e:
            return f"ComfyUI error: {e}"

    async def generate_moodboard(
        self, concepts: list[str], style: str = "moodboard, collage style"
    ) -> Optional[list[str]]:
        if not self.enabled:
            return None
        return [await self.generate_concept_render(c, style) for c in concepts]


class FluxIntegration:
    def __init__(self):
        self.enabled = False

    async def generate(self, prompt: str) -> Optional[str]:
        return None
