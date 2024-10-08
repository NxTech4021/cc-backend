import { Request, Response } from 'express';
import { handleDeleteAdminById } from '@services/adminService';

export const deleteAdminById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await handleDeleteAdminById(id);
    return res.sendStatus(200);
  } catch (err) {
    return res.status(400).json({ message: err });
  }
};
