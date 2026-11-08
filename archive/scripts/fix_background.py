from PIL import Image
import numpy as np

def fix_background(image_path):
    print(f"Processing {image_path}...")
    try:
        img = Image.open(image_path).convert("RGBA")
        data = np.array(img)

        # Define threshold for "dark" pixels to be considered background
        # Adjust these values if needed
        threshold = 30 
        
        # Create a mask where pixels are dark enough to be background
        # (r < threshold) AND (g < threshold) AND (b < threshold)
        r, g, b, a = data.T
        dark_areas = (r < threshold) & (g < threshold) & (b < threshold)
        
        # Set those pixels to pure black
        data[..., :-1][dark_areas.T] = (0, 0, 0)
        
        # Save back
        new_img = Image.fromarray(data)
        new_img.save(image_path)
        print(f"Successfully updated {image_path}")
        
    except Exception as e:
        print(f"Error processing image: {e}")

if __name__ == "__main__":
    # Path to the specific image
    image_path = "public/images/headlights/headlight_product_3.png"
    fix_background(image_path)
