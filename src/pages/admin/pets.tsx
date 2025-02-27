import React, { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { createServerSupabaseClient } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import { Pet } from '@/lib/supabase';
import AdminLayout from '@/components/layouts/AdminLayout';
import AuthMiddleware from '@/middlewares/AuthMiddleware';
import { getImageUrl, getPetTypeName, formatDate, getPetStatusColor } from '@/utils/helpers';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Avatar,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Menu,
  InputAdornment,
  CircularProgress,
  Alert,
  Divider,
  Grid,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  SelectChangeEvent
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Add as AddIcon
} from '@mui/icons-material';

interface AdminPetsProps {
  initialPets: Pet[];
  error?: string;
}

export default function AdminPets({ initialPets, error: serverError }: AdminPetsProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // State for pets and pagination
  const [pets, setPets] = useState<Pet[]>(initialPets || []);
  const [filteredPets, setFilteredPets] = useState<Pet[]>(initialPets || []);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // State for loading and error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(serverError || '');
  
  // State for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  
  // State for delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [petToDelete, setPetToDelete] = useState<Pet | null>(null);
  
  // State for status change dialog
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [petToUpdateStatus, setPetToUpdateStatus] = useState<Pet | null>(null);
  const [newStatus, setNewStatus] = useState('');
  
  // State for action menu
  const [actionAnchorEl, setActionAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  
  // Apply filters when search term or filters change
  useEffect(() => {
    filterPets();
  }, [searchTerm, statusFilter, typeFilter, pets]);
  
  // Filter pets based on search term and filters
  const filterPets = () => {
    let filtered = [...pets];
    
    // Apply search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(pet => 
        pet.title.toLowerCase().includes(term) || 
        pet.description.toLowerCase().includes(term) ||
        (pet.address && pet.address.toLowerCase().includes(term))
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(pet => pet.status === statusFilter);
    }
    
    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(pet => pet.pet_type === typeFilter);
    }
    
    setFilteredPets(filtered);
    setPage(0); // Reset to first page when filters change
  };
  
  // Fetch pets
  const fetchPets = async () => {
    try {
      setLoading(true);
      setError('');
      
      const { data, error } = await supabase
        .from('pets')
        .select(`
          *,
          profiles:user_id (name, email)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Process the data to match our Pet type
      const petsWithProfiles = data.map((pet: any) => ({
        ...pet,
        user_name: pet.profiles?.name,
        user_email: pet.profiles?.email
      }));
      
      setPets(petsWithProfiles);
    } catch (err: any) {
      console.error('Error fetching pets:', err);
      setError('Error al cargar las mascotas: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle delete
  const handleDeleteClick = (pet: Pet) => {
    setPetToDelete(pet);
    setDeleteDialogOpen(true);
  };
  
  const handleConfirmDelete = async () => {
    if (!petToDelete) return;
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('pets')
        .delete()
        .eq('id', petToDelete.id);
      
      if (error) throw error;
      
      // Update local state
      setPets(pets.filter(pet => pet.id !== petToDelete.id));
      
      setDeleteDialogOpen(false);
      setPetToDelete(null);
    } catch (err: any) {
      console.error('Error deleting pet:', err);
      setError('Error al eliminar la mascota: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle status change
  const handleStatusClick = (pet: Pet) => {
    setPetToUpdateStatus(pet);
    setNewStatus(pet.status);
    setStatusDialogOpen(true);
  };
  
  const handleConfirmStatusChange = async () => {
    if (!petToUpdateStatus || !newStatus) return;
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('pets')
        .update({ status: newStatus })
        .eq('id', petToUpdateStatus.id);
      
      if (error) throw error;
      
      // Update local state
      setPets(pets.map(pet => 
        pet.id === petToUpdateStatus.id 
          ? { ...pet, status: newStatus as any } 
          : pet
      ));
      
      setStatusDialogOpen(false);
      setPetToUpdateStatus(null);
      setNewStatus('');
    } catch (err: any) {
      console.error('Error updating pet status:', err);
      setError('Error al actualizar el estado de la mascota: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle action menu
  const handleActionMenuOpen = (event: React.MouseEvent<HTMLElement>, pet: Pet) => {
    setActionAnchorEl(event.currentTarget);
    setSelectedPet(pet);
  };
  
  const handleActionMenuClose = () => {
    setActionAnchorEl(null);
    setSelectedPet(null);
  };
  
  // Handle pagination
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Get stats for summary cards
  const stats = {
    total: pets.length,
    active: pets.filter(pet => pet.status === 'activo').length,
    inactive: pets.filter(pet => pet.status === 'inactivo').length,
    found: pets.filter(pet => pet.status === 'encontrado' || pet.status === 'adoptado').length,
  };

  return (
    <AuthMiddleware adminOnly>
      <AdminLayout>
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
            Gestión de Publicaciones
          </Typography>
          
          <Typography variant="body1" color="text.secondary" paragraph>
            Administra todas las publicaciones de mascotas de la plataforma
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 4 }}>
              {error}
            </Alert>
          )}
          
          {/* Stats summary */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card 
                elevation={2}
                sx={{ 
                  borderRadius: 2,
                  borderLeft: '4px solid',
                  borderColor: 'primary.main'
                }}
              >
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Total Publicaciones
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.total}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card 
                elevation={2}
                sx={{ 
                  borderRadius: 2,
                  borderLeft: '4px solid',
                  borderColor: 'success.main'
                }}
              >
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Activas
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    {stats.active}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card 
                elevation={2}
                sx={{ 
                  borderRadius: 2,
                  borderLeft: '4px solid',
                  borderColor: 'warning.main'
                }}
              >
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Inactivas
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="warning.main">
                    {stats.inactive}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card 
                elevation={2}
                sx={{ 
                  borderRadius: 2,
                  borderLeft: '4px solid',
                  borderColor: 'info.main'
                }}
              >
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Encontradas/Adoptadas
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="info.main">
                    {stats.found}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          {/* Filters */}
          <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Buscar por título, descripción o dirección"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  size="small"
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel id="status-filter-label">Estado</InputLabel>
                  <Select
                    labelId="status-filter-label"
                    value={statusFilter}
                    label="Estado"
                    onChange={(e: SelectChangeEvent<string>) => setStatusFilter(e.target.value)}
                  >
                    <MenuItem value="all">Todos</MenuItem>
                    <MenuItem value="activo">Activos</MenuItem>
                    <MenuItem value="inactivo">Inactivos</MenuItem>
                    <MenuItem value="encontrado">Encontrados</MenuItem>
                    <MenuItem value="adoptado">Adoptados</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel id="type-filter-label">Tipo</InputLabel>
                  <Select
                    labelId="type-filter-label"
                    value={typeFilter}
                    label="Tipo"
                    onChange={(e: SelectChangeEvent<string>) => setTypeFilter(e.target.value)}
                  >
                    <MenuItem value="all">Todos</MenuItem>
                    <MenuItem value="perro">Perros</MenuItem>
                    <MenuItem value="gato">Gatos</MenuItem>
                    <MenuItem value="ave">Aves</MenuItem>
                    <MenuItem value="conejo">Conejos</MenuItem>
                    <MenuItem value="otro">Otros</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={12} md={2}>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={fetchPets}
                  disabled={loading}
                  fullWidth
                >
                  Actualizar
                </Button>
              </Grid>
            </Grid>
          </Paper>
          
          {/* Table */}
          <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : filteredPets.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <WarningIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  No se encontraron mascotas
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Intenta cambiar los filtros de búsqueda o agrega una nueva publicación
                </Typography>
                <Button
                  variant="contained"
                  component={Link}
                  href="/pets/create"
                  startIcon={<AddIcon />}
                >
                  Nueva Publicación
                </Button>
              </Box>
            ) : (
              <>
                <TableContainer>
                  <Table sx={{ minWidth: 650 }}>
                    <TableHead>
                      <TableRow
                        sx={{
                          '& th': {
                            fontWeight: 'bold',
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'
                          }
                        }}
                      >
                        <TableCell>Mascota</TableCell>
                        <TableCell>Tipo</TableCell>
                        <TableCell>Usuario</TableCell>
                        <TableCell>Fecha</TableCell>
                        <TableCell>Estado</TableCell>
                        <TableCell align="right">Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredPets
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((pet) => (
                          <TableRow
                            key={pet.id}
                            sx={{
                              '&:last-child td, &:last-child th': { border: 0 },
                              '&:hover': { bgcolor: 'action.hover' }
                            }}
                          >
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Box
                                  sx={{
                                    width: 60,
                                    height: 60,
                                    borderRadius: 1,
                                    overflow: 'hidden',
                                    position: 'relative',
                                    mr: 2,
                                    flexShrink: 0
                                  }}
                                >
                                  <Image
                                    src={pet.image_url ? getImageUrl(pet.image_url) : 'https://source.unsplash.com/random?pet'}
                                    alt={pet.title}
                                    fill
                                    style={{ objectFit: 'cover' }}
                                  />
                                </Box>
                                <Box>
                                  <Typography variant="subtitle2" component="div" noWrap>
                                    {pet.title}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    noWrap
                                    sx={{ maxWidth: { xs: 150, sm: 200, md: 250 } }}
                                  >
                                    {pet.description?.substring(0, 50)}...
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={getPetTypeName(pet.pet_type)}
                                size="small"
                                color={pet.pet_type === 'perro' ? 'primary' : pet.pet_type === 'gato' ? 'secondary' : 'default'}
                              />
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar
                                  sx={{ width: 32, height: 32, mr: 1 }}
                                >
                                  {pet.user_name?.charAt(0).toUpperCase() || 'U'}
                                </Avatar>
                                <Box>
                                  <Typography variant="body2" noWrap>
                                    {pet.user_name || 'Usuario'}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary" noWrap>
                                    {pet.user_email || 'Sin email'}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              {formatDate(pet.created_at)}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={pet.status.charAt(0).toUpperCase() + pet.status.slice(1)}
                                size="small"
                                color={getPetStatusColor(pet.status)}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Tooltip title="Ver">
                                <IconButton
                                  component={Link}
                                  href={`/pets/${pet.id}`}
                                  size="small"
                                >
                                  <VisibilityIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Editar">
                                <IconButton
                                  component={Link}
                                  href={`/pets/edit/${pet.id}`}
                                  size="small"
                                  color="primary"
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Cambiar estado">
                                <IconButton
                                  onClick={() => handleStatusClick(pet)}
                                  size="small"
                                  color="info"
                                >
                                  <CheckCircleIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Eliminar">
                                <IconButton
                                  onClick={() => handleDeleteClick(pet)}
                                  size="small"
                                  color="error"
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  component="div"
                  count={filteredPets.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  labelRowsPerPage="Filas por página:"
                  labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                />
              </>
            )}
          </Paper>
          
          {/* Delete dialog */}
          <Dialog
            open={deleteDialogOpen}
            onClose={() => setDeleteDialogOpen(false)}
          >
            <DialogTitle>Eliminar publicación</DialogTitle>
            <DialogContent>
              <DialogContentText>
                ¿Estás seguro que deseas eliminar la publicación "{petToDelete?.title}"? Esta acción no se puede deshacer.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
              <Button 
                onClick={handleConfirmDelete} 
                color="error" 
                variant="contained"
                disabled={loading}
              >
                {loading ? 'Eliminando...' : 'Eliminar'}
              </Button>
            </DialogActions>
          </Dialog>
          
          {/* Status dialog */}
          <Dialog
            open={statusDialogOpen}
            onClose={() => setStatusDialogOpen(false)}
          >
            <DialogTitle>Cambiar estado</DialogTitle>
            <DialogContent>
              <DialogContentText sx={{ mb: 3 }}>
                Actualiza el estado de la publicación "{petToUpdateStatus?.title}".
              </DialogContentText>
              
              <FormControl fullWidth>
                <InputLabel id="new-status-label">Nuevo estado</InputLabel>
                <Select
                  labelId="new-status-label"
                  value={newStatus}
                  label="Nuevo estado"
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  <MenuItem value="activo">Activo</MenuItem>
                  <MenuItem value="inactivo">Inactivo</MenuItem>
                  <MenuItem value="encontrado">Encontrado</MenuItem>
                  <MenuItem value="adoptado">Adoptado</MenuItem>
                </Select>
              </FormControl>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setStatusDialogOpen(false)}>Cancelar</Button>
              <Button 
                onClick={handleConfirmStatusChange} 
                color="primary" 
                variant="contained"
                disabled={loading || !newStatus}
              >
                {loading ? 'Actualizando...' : 'Actualizar'}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </AdminLayout>
    </AuthMiddleware>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const supabase = createServerSupabaseClient();
  
  // Check if user is authenticated on the server
  const {
    data: { session },
  } = await supabase.auth.getSession();
  
  // If no session, redirect to login
  if (!session) {
    return {
      redirect: {
        destination: '/login?redirectTo=/admin/pets',
        permanent: false,
      },
    };
  }
  
  // Check if the user is an admin
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', session.user.id)
    .single();
  
  if (profileError || !profile?.is_admin) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }
  
  try {
    // Get pets with user info
    const { data, error } = await supabase
      .from('pets')
      .select(`
        *,
        profiles:user_id (name, email)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Process the data to match our Pet type
    const pets = data.map((pet: any) => ({
      ...pet,
      user_name: pet.profiles?.name,
      user_email: pet.profiles?.email
    }));
    
    return {
      props: {
        initialPets: pets,
      },
    };
  } catch (error: any) {
    console.error('Error fetching pets for admin:', error.message);
    
    return {
      props: {
        initialPets: [],
        error: 'Error al cargar las mascotas. Por favor intenta de nuevo más tarde.'
      },
    };
  }
};
