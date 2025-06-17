// src/components/CustomerSearch.tsx
import { useState, useEffect } from 'react';
import { Autocomplete, TextField, CircularProgress, createFilterOptions } from '@mui/material';
import axiosInstance from '../api/axiosInstance';
import type { Customer } from '../types';

// Define a special shape for our options, including the "Create New" option
interface CustomerOptionType extends Partial<Customer> {
  name: string;
  isNew?: boolean;
}

const filter = createFilterOptions<CustomerOptionType>();

interface CustomerSearchProps {
  onSelectCustomer: (customer: Customer) => void;
  onCreateNew: (name: string) => void; // A function to signal we need to create a new customer
}

export default function CustomerSearch({ onSelectCustomer, onCreateNew }: CustomerSearchProps) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<readonly CustomerOptionType[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');

  // This useEffect handles fetching customers as the user types
  useEffect(() => {
    let active = true;

    if (inputValue === '') {
      setOptions([]);
      return undefined;
    }

    setLoading(true);
    const debounceTimer = setTimeout(() => {
      axiosInstance.get('/api/v1/customers/search', { params: { q: inputValue } })
        .then((response) => {
          if (active) {
            setOptions(response.data);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }, 300); // 300ms delay after user stops typing

    return () => {
      active = false;
      clearTimeout(debounceTimer);
    };
  }, [inputValue]);

  return (
    <Autocomplete
      id="customer-search-autocomplete"
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      onChange={(event, value) => {
        if (!value) return;
        if (typeof value === 'string' || value.isNew) {
          // User selected the "Create new" option
          onCreateNew(inputValue);
        } else if (value && value.id) {
          // User selected an existing customer
          onSelectCustomer(value as Customer);
        }
        setInputValue(''); // Reset input after selection
      }}
      inputValue={inputValue}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
      }}
      filterOptions={(options, params) => {
        const filtered = filter(options, params);
        // If the user has typed and no options are found, suggest creating a new one
        if (params.inputValue !== '' && filtered.length === 0 && !loading) {
          filtered.push({
            isNew: true,
            name: `Create new customer "${params.inputValue}"`,
          });
        }
        return filtered;
      }}
      getOptionLabel={(option) => {
        if (typeof option === 'string') return option;
        // This makes sure our special "Create new" option displays correctly
        if (option.isNew) return option.name;
        // This displays existing customers nicely
        const contactInfo = option.phone_number || option.email;
        return `${option.name}${contactInfo ? ` - ${contactInfo}` : ''}`;
      }}
      options={options}
      loading={loading}
      freeSolo // Allows the user to type text that doesn't match any option
      renderInput={(params) => (
        <TextField
          {...params}
          label="Find Customer (Name, Phone...)"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
}
