'use client';
import React, { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { userRequest } from '@/lib/RequestMethods';
import toast from 'react-hot-toast';
import { formatDate } from '@/utils/FormHelpers/formatDate';
import { getCurrentDate, getCurrentTime } from '@/utils/FormHelpers/CurrentDateTime';
import { useCurrentUser } from '@/lib/hooks';


// Initial form values
const initialValues = {
    requestedGuardId: '',
    guardId: '',
    locationId: '',
    guardCategoryId: '',
    deploymentTill: '',

};
// Validation schema
const validationSchema = Yup.object({
    //we will send guard id but show service number in the form

    guardId: Yup.string().required('Guard name is required'),
    locationId: Yup.string().required('Location ID is required'),
    guardCategoryId: Yup.string().required('Assign category is required'), //sending guard category id but show guard category in the form
});

const AssignGuardsForm = () => {
    const { user } = useCurrentUser();
    const [guards, setGuards] = useState([]);
    console.log(guards)
    const [selectedGuardId, setSelectedGuardId] = useState(null);
    const [clients, setClients] = useState([]);
    console.log(clients)
    const [selectedClient, setSelectedClient] = useState(null);
    const [selectedLocationId, setSelectedLocationId] = useState(null);
    const [requestedGuards, setRequestedGuards] = useState([]);
    const [selectedRequestedGuard, setSelectedRequestedGuard] = useState(null);
    const [assignedGuardForLocation, setAssignedGuardForLocation] = useState([]);


    useEffect(() => {
        const getGuardsByOrganization = async () => {
            try {
                const res = await userRequest.get("/guards/by-organization");
                setGuards(res.data.data);

            } catch (error) {
                console.log(error)
            }
        }

        const getClients = async () => {
            try {
                const res = await userRequest.get("/clients/by-organization");
                setClients(res.data.data);

            } catch (error) {
                console.log(error)
            }
        }

        const getAssignedGuardForLocation = async () => {
            try {
                const res = await userRequest.get(`/guards/assigned-guard/${selectedGuardId}`);
                setAssignedGuardForLocation(res.data.data);

            } catch (error) {
                console.log(error)
            }
        }


        selectedGuardId && getAssignedGuardForLocation();
        getGuardsByOrganization();
        getClients();
    }, [selectedGuardId]);

    useEffect(() => {

        const requestedGuardsByLocationId = async () => {
            try {
                const res = await userRequest.get(`/location/requested-guards/${selectedLocationId}`);
                setRequestedGuards(res.data.data);

            } catch (error) {
                console.log(error)
            }
        }
        selectedLocationId && requestedGuardsByLocationId();
    }, [selectedLocationId]);


    const handleSubmit = async (values, { setSubmitting, resetForm }) => {

        const assignGuardsPayload = {
            guardId: values.guardId,
            locationId: values.locationId,
            guardCategoryId: values.guardCategoryId,
            requestedGuardId: selectedRequestedGuard?.id,
            guardCategoryId: selectedRequestedGuard?.guardCategory?.id,
        }

        try {

            const res = await userRequest.post('/guards/assign-guard', assignGuardsPayload);

            toast.success('Guard assigned successfully');


            resetForm();
        } catch (error) {
            console.log('Error:', error);
            const errorMessage = await error?.response?.data?.message;
            if (errorMessage === "requestedGuardId must be unique.") {
                toast.error("Guard already assigned to this location");
            }
            else {
                toast.error(`Error: ${errorMessage}`);
            }

        }

        setSubmitting(false);

    };

    const handleCancel = (resetForm) => {
        // Reset form
        resetForm();
    };

    const handleClientChange = (e) => {
        const clientId = e.target.value;
        const client = clients.find((client) => client.id === clientId);
        setSelectedClient(client);

    }

    return (
        <div className="min-h-screen bg-formBGBlue flex flex-col w-full px-4 pt-4">
            {/* Breadcrumb */}
            <div className="w-full max-w-7xl">
                <aside className="bg-white border-b rounded-xl border-gray-200">
                    <div className="px-6 py-4">
                        <article className="flex items-center space-x-2 text-sm text-gray-600">
                            <span>Dashboard</span>
                            <span>&gt;</span>
                            <span>Deployment</span>
                            <span>&gt;</span>
                            <span className="text-gray-900 font-medium">Assign Guard</span>
                        </article>
                    </div>
                </aside>
            </div>

            {/* Form Card */}
            <div className="w-full max-w-7xl bg-white rounded-xl shadow-md mt-8 p-8">
                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {({ values, errors, touched, isSubmitting, resetForm, setFieldValue }) => (
                        <Form className="space-y-8">
                            {/* Auto Fields Row */}
                            <div className="grid grid-cols-4 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Office ID
                                    </label>
                                    <div className="px-4 py-3 bg-formBgLightGreen border border-gray-200 rounded-md text-gray-500">
                                        {user?.id?.slice(0, 8)}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Staff ID
                                    </label>
                                    <div className="px-4 py-3 bg-formBgLightGreen border border-gray-200 rounded-md text-gray-500">
                                        Auto
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Date
                                    </label>
                                    <div className="px-4 py-3 bg-formBgLightGreen border border-gray-200 rounded-md text-gray-500">
                                        {formatDate(getCurrentDate())}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-themeGray mb-2">
                                        Time
                                    </label>
                                    <div className="px-4 py-3 bg-formBgLightGreen border border-gray-200 rounded-md text-gray-500">
                                        {getCurrentTime()}
                                    </div>
                                </div>
                            </div>

                            {/* Tag Guard Section */}
                            <div className="space-y-6">
                                <h2 className="text-lg font-medium text-gray-900">Tag Guard with Location</h2>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            SERVICE. No.
                                        </label>
                                        <div className="relative">
                                            <Field
                                                as="select"
                                                name="guardId"
                                                onChange={(e) => {
                                                    const guardId = e.target.value;
                                                    setFieldValue('guardId', guardId);
                                                    setSelectedGuardId(guardId);

                                                    if (guardId) {
                                                        // Find the selected guard and set the guardId field
                                                        const selectedGuard = guards.find(guard => guard.id === guardId);
                                                        if (selectedGuard) {
                                                            setFieldValue('guardId', selectedGuard.id);
                                                        }
                                                    } else {
                                                        setFieldValue('guardId', '');
                                                    }
                                                }}
                                                className={`w-full px-4 py-3 bg-formBgLightBlue border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none ${errors.guardId && touched.guardId
                                                    ? 'border-red-500'
                                                    : 'border-gray-200'
                                                    }`}
                                            >
                                                <option value="">Select</option>
                                                {guards?.map((guard) => (
                                                    <option key={guard.id} value={guard.id}>
                                                        {guard.serviceNumber}
                                                    </option>
                                                ))}
                                            </Field>
                                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                            {errors.guardId && touched.guardId && (
                                                <div className="text-red-500 text-sm mt-1">{errors.guardId}</div>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Guard Name
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                readOnly
                                                value={guards?.find((guard) => guard.id === values.guardId)?.fullName || ''}
                                                className="w-full px-4 py-3 bg-formBgLightBlue border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Guard name will appear here"
                                            />
                                            {errors.guardId && touched.guardId && (
                                                <div className="text-red-500 text-sm mt-1">{errors.guardId}</div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Bottom Form Section */}
                                <div className="grid grid-cols-3 gap-6">
                                    {/* clientId field */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Client ID
                                        </label>
                                        <div className="relative">
                                            <Field
                                                as="select"
                                                name="clientId"
                                                onChange={(e) => {
                                                    setFieldValue('clientId', e.target.value);
                                                    handleClientChange(e);
                                                }}
                                                className={`w-full px-4 py-3 bg-formBgLightBlue border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none ${errors.clientId && touched.clientId
                                                    ? 'border-red-500'
                                                    : 'border-gray-200'
                                                    }`}
                                            >
                                                <option value="" disabled>Select</option>
                                                {clients?.map((client) => (
                                                    <option key={client.id} value={client.id} className='text-sm'>
                                                        {client.contractNumber} ({client.companyName})
                                                    </option>
                                                ))}
                                            </Field>

                                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                            {errors.clientId && touched.clientId && (
                                                <div className="text-red-500 text-sm mt-1">{errors.clientId}</div>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Location ID
                                        </label>
                                        <div className="relative">
                                            <Field
                                                as="select"
                                                name="locationId"
                                                onChange={(e) => {
                                                    setFieldValue('locationId', e.target.value);
                                                    setSelectedLocationId(e.target.value);
                                                }}
                                                className={`w-full px-4 py-3 bg-formBgLightBlue border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none ${errors.locationId && touched.locationId
                                                    ? 'border-red-500'
                                                    : 'border-gray-200'
                                                    }`}
                                            >
                                                <option value="">Select</option>
                                                {selectedClient?.location?.map((location) => (
                                                    <option key={location.id} value={location.id}>
                                                        {location.locationName} -  ({location.createdLocationId})
                                                    </option>
                                                ))}
                                            </Field>
                                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                            {errors.locationId && touched.locationId && (
                                                <div className="text-red-500 text-sm mt-1">{errors.locationId}</div>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Assign category
                                        </label>
                                        <div className="relative">
                                            <Field
                                                as="select"
                                                name="guardCategoryId"
                                                onChange={(e) => {
                                                    const guardCategoryId = e.target.value;
                                                    setFieldValue('guardCategoryId', guardCategoryId);

                                                    // Find the selected requested guard
                                                    const selectedGuard = requestedGuards.find(guard => guard.guardCategory.id === guardCategoryId);
                                                    setSelectedRequestedGuard(selectedGuard);
                                                }}
                                                className={`w-full px-4 py-3 bg-formBgLightBlue border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none ${errors.guardCategoryId && touched.guardCategoryId
                                                    ? 'border-red-500'
                                                    : 'border-gray-200'
                                                    }`}
                                            >
                                                <option value="">Select</option>
                                                {requestedGuards.map((requestedGuard) => (
                                                    <option key={requestedGuard.guardCategory.id} value={requestedGuard.guardCategory.id}>
                                                        {requestedGuard.guardCategory.categoryName}
                                                    </option>
                                                ))}
                                            </Field>
                                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                            {errors.guardCategoryId && touched.guardCategoryId && (
                                                <div className="text-red-500 text-sm mt-1">{errors.guardCategoryId}</div>
                                            )}
                                        </div>
                                    </div>


                                </div>

                                {/* Buttons */}
                                <div className="flex justify-center space-x-4 pt-8">
                                    <button
                                        type="button"
                                        onClick={() => handleCancel(resetForm)}
                                        className="px-8 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? 'Submitting...' : 'Submit'}
                                    </button>
                                </div>
                            </div>
                        </Form>
                    )}
                </Formik>


                {/* Table - Outside Formik */}
                {assignedGuardForLocation && assignedGuardForLocation?.id && (
                    <>
                        <h2 className="text-lg font-medium text-gray-900 pt-5 pb-2 pl-2">Assigned Guard Details
                        </h2>

                        <div className="rounded-2xl bg-formBGBlue p-6">


                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200">
                                            <th className="text-left py-3 px-4 font-medium text-gray-700">Client ID</th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-700">Location ID</th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-700">Deployment Date</th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-700">Deployed Till</th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-700">Total Working Days</th>
                                        </tr>
                                    </thead>
                                    <tbody className='bg-white rounded-2xl'>
                                        <tr className="border-b border-gray-100">
                                            <td className="py-3 px-4 text-gray-600">{assignedGuardForLocation?.location?.clientId.slice(0, 4)}</td>
                                            <td className="py-3 px-4 text-gray-600">{assignedGuardForLocation?.location?.createdLocationId}</td>
                                            <td className="py-3 px-4 text-gray-600">
                                                {formatDate(assignedGuardForLocation?.deploymentDate)}
                                            </td>
                                            <td className="py-3 px-4 text-gray-600">
                                                {formatDate(assignedGuardForLocation?.deploymentTill)}
                                            </td>
                                            <td className="py-3 px-4 text-gray-600">{assignedGuardForLocation?.totalWorkingDays}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AssignGuardsForm;