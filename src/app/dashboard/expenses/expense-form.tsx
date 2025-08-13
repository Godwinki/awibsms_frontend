import React, { useState } from 'react';
import { Combobox } from '@/components/ui/combobox';
import { toast } from '@/components/ui/use-toast';

const ExpenseForm: React.FC = () => {
  const [formData, setFormData] = useState({
    departmentId: '',
  });

  const [selectedDepartment, setSelectedDepartment] = useState('');

  const departments = [
    { id: '1', name: 'Department 1' },
    { id: '2', name: 'Department 2' },
    { id: '3', name: 'Department 3' },
  ];

  const handleDepartmentChange = (selectedDepartment: Department | string) => {
    if (typeof selectedDepartment === 'string') {
      const department = departments?.find(
        (dept) => dept.name.toLowerCase() === selectedDepartment.toLowerCase()
      );
      
      if (department) {
        setFormData({ ...formData, departmentId: department.id });
      } else {
        toast({
          title: "Department not found",
          description: "Please select a valid department from the dropdown",
          variant: "destructive",
        });
      }
    } else {
      setFormData({ ...formData, departmentId: selectedDepartment.id });
    }
  };

  return (
    <div>
      {/* ... existing code ... */}

      <Combobox
        items={departments || []}
        value={selectedDepartment}
        onChange={(department) => {
          setSelectedDepartment(department);
          handleDepartmentChange(department);
        }}
      />

      {/* ... existing code ... */}
    </div>
  );
};

export default ExpenseForm; 