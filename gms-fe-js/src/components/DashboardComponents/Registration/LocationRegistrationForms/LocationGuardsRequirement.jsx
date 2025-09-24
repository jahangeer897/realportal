//Also known as guards requirements
import React, { useEffect, useState } from 'react';
import { Formik, Form, Field, FieldArray, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useCurrentUser } from '@/lib/hooks';
import { userRequest } from '@/lib/RequestMethods';

const LocationGuardsRequirement = ({ onNext, onPrevious, onSave, initialData = {} }) => {

  const [isLoading, setisLoading] = useState(false)
  const [createdGuardCategories, setCreatedGuardCategories] = useState(null);
  const [allShifts, setAllShifts] = useState(null);

  const validationSchema = Yup.object().shape({
    guards: Yup.array().of(
      Yup.object().shape({
        guardCategoryId: Yup.string().required("Required"),
        quantity: Yup.number()
          .typeError("Must be a number")
          .required("Required")
          .min(1, "Min 1"),
        shiftId: Yup.string().required("Required"),
        chargesPerMonth: Yup.number()
          .typeError("Must be a number")
          .required("Required")
          .min(0, "Cannot be negative"),
        overtimePerHour: Yup.number()
          .typeError("Must be a number")
          .required("Required")
          .min(0, "Cannot be negative"),
        allowance: Yup.number()
          .typeError("Must be a number")
          .required("Required")
          .min(0, "Cannot be negative"),
        gazettedHoliday: Yup.number().typeError("Must be a number").required("Required").min(0, "Cannot be negative")
      })
    )
  });

  // Ensure initial values have a proper guards array
  const defaultInitialValues = {
    guards: [{
      guardCategoryId: '',
      quantity: '',
      shiftId: '',
      chargesPerMonth: '',
      overtimePerHour: '',
      allowance: '',
      gazettedHoliday: ''
    }],
    ...initialData
  };


  useEffect(() => {

    const getCreatedGuardCategories = async () => {
      setisLoading(true)
      const res = await userRequest.get("/guard-category/by-organization");
      setCreatedGuardCategories(res.data.data);

      if (res.data) {
        setisLoading(false)
      }

    }

    const getShiftTypes = async () => {
      const res = await userRequest.get("/shifts");
      setAllShifts(res.data.data);


    }

    getCreatedGuardCategories();
    getShiftTypes();

  }, [])

  return (
    <div className="flex-1 bg-white p-8 rounded-xl">
      {/* Header */}
      <aside className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Details of Guards/ Employees Requested</h2>
          <div className="text-sm text-gray-500">Step 2 of 4</div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-formButtonBlue h-2 rounded-full" style={{ width: '50%' }}></div>
        </div>
      </aside>

      <Formik
        initialValues={defaultInitialValues}
        validationSchema={validationSchema}
        onSubmit={(values) => {
          // console.log('Guards Requirement Form Values:', values);
          onSave(values);
          onNext(values);
        }}
      >
        {({ values }) => (
          <Form>
            <FieldArray name="guards">
              {({ push, remove }) => (
                <div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="p-2 text-left text-xs font-medium text-gray-700">Guard Category</th>
                          <th className="p-2 text-left text-xs font-medium text-gray-700">Nos. of Person</th>
                          <th className="p-2 text-left text-xs font-medium text-gray-700">Shift Type</th>
                          <th className="p-2 text-left text-xs font-medium text-gray-700">Charges/Month</th>
                          <th className="p-2 text-left text-xs font-medium text-gray-700">Overtime/Hour</th>
                          <th className="p-2 text-left text-xs font-medium text-gray-700">Allowance</th>
                          <th className="p-2 text-left text-xs font-medium text-gray-700">Gazeted Holiday</th>
                          <th className="p-2"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">

                        {values.guards && values.guards.length > 0 && values.guards.map((guard, index) => (
                          <tr key={index}>
                            <td className="p-2 w-48">
                              <Field name={`guards.${index}.guardCategoryId`} as="select" className="w-full px-5 py-2 text-sm bg-formBgLightBlue border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500">
                                <option value="">Select</option>
                                {createdGuardCategories?.map((cat) => (
                                  <option className='text-sm' value={cat.id} key={cat.id}>
                                    {cat.categoryName}
                                  </option>
                                ))}
                              </Field>
                              <ErrorMessage name={`guards.${index}.guardCategoryId`} component="div" className="text-red-500 text-xs" />
                            </td>
                            <td className="p-2 w-24">
                              <Field name={`guards.${index}.quantity`} type="number" placeholder="Enter" className="w-20 px-2 py-2 text-sm bg-formBgLightBlue border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500" />
                              <ErrorMessage name={`guards.${index}.quantity`} component="div" className="text-red-500 text-xs" />
                            </td>
                            <td className="p-2 w-40">
                              <Field name={`guards.${index}.shiftId`} as="select" className="w-full px-6 py-2 text-sm bg-formBgLightBlue border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500">
                                <option value="" disabled>Select</option>
                                {allShifts?.map((shift) => (
                                  <option key={shift.id} value={shift.id}>{shift.shiftName}</option>
                                ))}

                              </Field>
                              <ErrorMessage name={`guards.${index}.shiftId`} component="div" className="text-red-500 text-xs" />
                            </td>
                            <td className="p-2 w-24">
                              <Field name={`guards.${index}.chargesPerMonth`} type="number" placeholder="Enter" className="w-20 px-2 py-2 text-sm bg-formBgLightBlue border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500" />
                              <ErrorMessage name={`guards.${index}.chargesPerMonth`} component="div" className="text-red-500 text-xs" />
                            </td>
                            <td className="p-2 w-24">
                              <Field name={`guards.${index}.overtimePerHour`} type="number" placeholder="Enter" className="w-20 px-2 py-2 text-sm bg-formBgLightBlue border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500" />
                              <ErrorMessage name={`guards.${index}.overtimePerHour`} component="div" className="text-red-500 text-xs" />
                            </td>
                            <td className="p-2 w-24">
                              <Field name={`guards.${index}.allowance`} type="number" placeholder="Enter" className="w-20 px-2 py-2 text-sm bg-formBgLightBlue border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500" />
                              <ErrorMessage name={`guards.${index}.allowance`} component="div" className="text-red-500 text-xs" />
                            </td>
                            <td className="p-2 w-24">
                              <Field name={`guards.${index}.gazettedHoliday`} type="number" placeholder="Enter" className="w-20 px-2 py-2 text-sm bg-formBgLightBlue border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500" />
                              <ErrorMessage name={`guards.${index}.gazettedHoliday`} component="div" className="text-red-500 text-xs" />
                            </td>
                            <td className="px-1 py-3">
                              <button
                                type="button"
                                onClick={() => {
                                  remove(index);
                                  setTimeout(() => {
                                    const updatedGuards = (values.guards || []).filter((_, i) => i !== index);
                                    onSave({ guards: updatedGuards });
                                  }, 0);
                                }}
                                className="text-red-500 text-[13px]"
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => {
                        const newGuard = { guardCategoryId: '', quantity: '', shiftId: '', chargesPerMonth: '', overtimePerHour: '', allowance: '', gazettedHoliday: '' };
                        push(newGuard);
                        setTimeout(() => onSave({ guards: [...(values.guards || []), newGuard] }), 0);
                      }}
                      className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              )}
            </FieldArray>
            <div className="mt-8 flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => onPrevious()}
                className="px-8 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-formBgLightBlue focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-8 py-3 bg-formButtonBlue text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Next
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default LocationGuardsRequirement;