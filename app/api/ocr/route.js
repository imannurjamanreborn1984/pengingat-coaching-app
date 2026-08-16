const handleImageChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  setImage(file);
  setPreview(URL.createObjectURL(file));
  // Panggilan ke runOcr() dihapus total agar tidak memicu error API lagi
};