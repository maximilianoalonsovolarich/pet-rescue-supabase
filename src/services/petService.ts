import { supabase } from '@/lib/supabase';
import { Pet } from '@/lib/supabase';

// Types for filtering pets
export type PetFilters = {
  pet_type?: string;
  pet_size?: string;
  pet_gender?: string;
  status?: string;
  search?: string;
  userId?: string;
  page?: number;
  limit?: number;
};

/**
 * Get all pets with optional filtering
 */
export const getPets = async (filters: PetFilters = {}) => {
  try {
    // Start with base query
    let query = supabase
      .from('pets')
      .select(`
        *,
        profiles:user_id (name, email, phone)
      `);

    // Apply filters
    if (filters.pet_type) {
      query = query.eq('pet_type', filters.pet_type);
    }

    if (filters.pet_size) {
      query = query.eq('pet_size', filters.pet_size);
    }

    if (filters.pet_gender) {
      query = query.eq('pet_gender', filters.pet_gender);
    }

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.userId) {
      query = query.eq('user_id', filters.userId);
    }

    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,address.ilike.%${filters.search}%`);
    }

    // Order by most recent first
    query = query.order('created_at', { ascending: false });

    // Apply pagination if specified
    if (filters.page !== undefined && filters.limit !== undefined) {
      const from = filters.page * filters.limit;
      const to = from + filters.limit - 1;
      query = query.range(from, to);
    }

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    // Process the data to match our Pet type
    const pets = data.map((pet: any) => ({
      ...pet,
      user_name: pet.profiles?.name,
      user_email: pet.profiles?.email,
      user_phone: pet.profiles?.phone,
    }));

    return {
      pets,
      count: count || pets.length,
    };
  } catch (error) {
    console.error('Error fetching pets:', error);
    throw error;
  }
};

/**
 * Get a pet by ID
 */
export const getPetById = async (id: string) => {
  try {
    // Increment views
    await supabase.rpc('increment_pet_views', { pet_id: id });

    // Get pet details
    const { data, error } = await supabase
      .from('pets')
      .select(`
        *,
        profiles:user_id (name, email, phone)
      `)
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    // Process the data to match our Pet type
    const pet: Pet = {
      ...data,
      user_name: data.profiles?.name,
      user_email: data.profiles?.email,
      user_phone: data.profiles?.phone,
    };

    // Fetch similar pets
    const { data: similarData } = await supabase
      .from('pets')
      .select('id, title, pet_type, image_url')
      .eq('pet_type', pet.pet_type)
      .neq('id', id)
      .eq('status', 'activo')
      .limit(4);

    // Add similar pets to the result
    return {
      ...pet,
      similar_pets: similarData || [],
    };
  } catch (error) {
    console.error(`Error fetching pet with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new pet posting
 */
export const createPet = async (petData: any, images: File[]) => {
  try {
    // First upload the user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData.user) {
      throw new Error('User not authenticated');
    }

    const userId = userData.user.id;
    
    // Upload images if any
    let imageUrl = null;
    let additionalImages = [];

    if (images.length > 0) {
      // Upload main image
      const mainImage = images[0];
      const mainImagePath = `${userId}/${Date.now()}_main`;
      
      const { data: mainImageData, error: mainImageError } = await supabase.storage
        .from('pet-images')
        .upload(mainImagePath, mainImage, {
          cacheControl: '3600',
          upsert: false,
        });

      if (mainImageError) {
        throw mainImageError;
      }

      imageUrl = mainImagePath;

      // Upload additional images if any
      if (images.length > 1) {
        for (let i = 1; i < images.length; i++) {
          const additionalImage = images[i];
          const additionalImagePath = `${userId}/${Date.now()}_${i}`;
          
          const { data: additionalImageData, error: additionalImageError } = await supabase.storage
            .from('pet-images')
            .upload(additionalImagePath, additionalImage, {
              cacheControl: '3600',
              upsert: false,
            });

          if (additionalImageError) {
            console.error(`Error uploading additional image ${i}:`, additionalImageError);
            continue;
          }

          additionalImages.push(additionalImagePath);
        }
      }
    }

    // Create the pet record
    const { data, error } = await supabase
      .from('pets')
      .insert({
        user_id: userId,
        title: petData.title,
        description: petData.description,
        pet_type: petData.pet_type,
        pet_size: petData.pet_size || null,
        pet_color: petData.pet_color || null,
        pet_gender: petData.pet_gender || null,
        pet_age: petData.pet_age || null,
        image_url: imageUrl,
        additional_images: additionalImages.length > 0 ? additionalImages : null,
        latitude: petData.latitude || null,
        longitude: petData.longitude || null,
        address: petData.address || null,
        status: 'activo',
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error creating pet:', error);
    throw error;
  }
};

/**
 * Update an existing pet posting
 */
export const updatePet = async (id: string, petData: any, newImage?: File) => {
  try {
    // Check if the pet exists and user has permission
    const { data: existingPet, error: fetchError } = await supabase
      .from('pets')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    // Get current user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData.user) {
      throw new Error('User not authenticated');
    }

    // Create update object
    const updates: any = {
      updated_at: new Date().toISOString(),
    };

    // Add fields that are being updated
    if (petData.title !== undefined) updates.title = petData.title;
    if (petData.description !== undefined) updates.description = petData.description;
    if (petData.pet_type !== undefined) updates.pet_type = petData.pet_type;
    if (petData.pet_size !== undefined) updates.pet_size = petData.pet_size;
    if (petData.pet_color !== undefined) updates.pet_color = petData.pet_color;
    if (petData.pet_gender !== undefined) updates.pet_gender = petData.pet_gender;
    if (petData.pet_age !== undefined) updates.pet_age = petData.pet_age;
    if (petData.latitude !== undefined) updates.latitude = petData.latitude;
    if (petData.longitude !== undefined) updates.longitude = petData.longitude;
    if (petData.address !== undefined) updates.address = petData.address;
    if (petData.status !== undefined) updates.status = petData.status;

    // Upload new image if provided
    if (newImage) {
      const imagePath = `${userData.user.id}/${Date.now()}_updated`;
      
      const { data: imageData, error: imageError } = await supabase.storage
        .from('pet-images')
        .upload(imagePath, newImage, {
          cacheControl: '3600',
          upsert: false,
        });

      if (imageError) {
        throw imageError;
      }

      updates.image_url = imagePath;

      // Delete old image if exists
      if (existingPet.image_url) {
        await supabase.storage
          .from('pet-images')
          .remove([existingPet.image_url]);
      }
    }

    // Update the pet
    const { data, error } = await supabase
      .from('pets')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`Error updating pet with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a pet posting
 */
export const deletePet = async (id: string) => {
  try {
    // Get the pet to find the images to delete
    const { data: pet, error: fetchError } = await supabase
      .from('pets')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    // Delete images from storage if they exist
    const imagesToDelete = [];
    if (pet.image_url) {
      imagesToDelete.push(pet.image_url);
    }
    if (pet.additional_images && pet.additional_images.length > 0) {
      imagesToDelete.push(...pet.additional_images);
    }

    if (imagesToDelete.length > 0) {
      const { error: storageError } = await supabase.storage
        .from('pet-images')
        .remove(imagesToDelete);

      if (storageError) {
        console.error('Error deleting images:', storageError);
        // Continue anyway to delete the record
      }
    }

    // Delete the pet record
    const { error } = await supabase
      .from('pets')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error(`Error deleting pet with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Get user statistics
 */
export const getUserStats = async (userId: string) => {
  try {
    // Get total pet count
    const { data: totalPets, error: totalError } = await supabase
      .from('pets')
      .select('id', { count: 'exact' })
      .eq('user_id', userId);

    if (totalError) {
      throw totalError;
    }

    // Get active pet count
    const { data: activePets, error: activeError } = await supabase
      .from('pets')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)
      .eq('status', 'activo');

    if (activeError) {
      throw activeError;
    }

    // Get total views count
    const { data: viewsData, error: viewsError } = await supabase
      .from('pets')
      .select('views')
      .eq('user_id', userId);

    if (viewsError) {
      throw viewsError;
    }

    const totalViews = viewsData.reduce((sum, pet) => sum + (pet.views || 0), 0);

    return {
      totalPets: totalPets.length,
      activePets: activePets.length,
      totalViews
    };
  } catch (error) {
    console.error(`Error getting stats for user ${userId}:`, error);
    throw error;
  }
};
