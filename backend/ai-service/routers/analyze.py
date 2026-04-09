from fastapi import APIRouter, UploadFile, File, HTTPException
from services.vision_service import analyze_food_image

router = APIRouter(prefix="/analyze", tags=["AI Vision"])


@router.post("/photo")
async def analyze_photo(file: UploadFile = File(...)):
    """
    Analyze a food photo using AI vision and return nutritional estimate.
    Called by Node.js backend for POST /meals/photo-analyze.
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image.")

    image_bytes = await file.read()
    if len(image_bytes) > 10 * 1024 * 1024:  # 10MB limit
        raise HTTPException(status_code=413, detail="Image too large. Maximum size is 10MB.")

    result = await analyze_food_image(image_bytes)
    return {"data": result}
