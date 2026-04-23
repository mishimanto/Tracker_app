<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\ImageManager;

class ImageUploadService
{
    /**
     * Raster image formats that can be safely re-encoded to WebP.
     */
    protected array $convertibleExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'avif'];

    public function storeOptimizedImage(
        UploadedFile $file,
        string $directory,
        ?string $oldPath = null,
        array $options = []
    ): string {
        $disk = $options['disk'] ?? 'public';
        $extension = strtolower($file->getClientOriginalExtension());
        $shouldConvert = in_array($extension, $this->convertibleExtensions, true);

        if (!$shouldConvert) {
            $path = $file->store($directory, $disk);
            $this->deleteOldFile($oldPath, $disk);

            return $path;
        }

        $manager = ImageManager::gd();
        $image = $manager->read($file->getRealPath());
        $maxWidth = $options['max_width'] ?? null;
        $maxHeight = $options['max_height'] ?? null;
        $quality = $options['quality'] ?? 80;

        if ($maxWidth || $maxHeight) {
            $image = $image->scaleDown($maxWidth, $maxHeight);
        }

        $encodedImage = $image->toWebp($quality);
        $path = trim($directory, '/') . '/' . Str::uuid() . '.webp';

        Storage::disk($disk)->put($path, (string) $encodedImage);
        $this->deleteOldFile($oldPath, $disk);

        return $path;
    }

    public function deleteOldFile(?string $path, string $disk = 'public'): void
    {
        if ($path) {
            Storage::disk($disk)->delete($path);
        }
    }
}
