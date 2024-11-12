import challengeData from '../assets/campaignData.json'
import { useState, useEffect, useMemo } from 'react' // Add useMemo
import { useLocation, useParams, useNavigate } from 'react-router-dom'
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    flexRender,
} from '@tanstack/react-table'

function MainTable() {
    const location = useLocation()
    const params = useParams()
    const navigate = useNavigate() // Add this hook
    const [sorting, setSorting] = useState([])
    const [data, setData] = useState(challengeData.challenges)
    const [columnFilters, setColumnFilters] = useState([])

    // Define columns using useMemo to prevent unnecessary re-renders
    const columns = useMemo(
        () => [
            {
                accessorKey: 'id',
                header: 'challenge ID',
                cell: info => <span className="font-medium">{info.getValue()}</span>
            },
            {
                accessorKey: 'name',
                header: 'Name',
                cell: info => <span className="text-blue-600 hover:text-blue-800">{info.getValue()}</span>
            },
            {
                accessorKey: 'status',
                header: 'Status',
                cell: ({ row }) => (
                    <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            row.original.status === 'Active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                        }`}
                    >
                        {row.original.status}
                    </span>
                ),
            },
            {
                accessorKey: 'type',
                header: 'Type',
                cell: info => (
                    <span className={`${
                        info.getValue() === 'Deterministic' 
                            ? 'text-purple-600' 
                            : 'text-orange-600'
                    }`}>
                        {info.getValue()}
                    </span>
                )
            },
            {
                accessorKey: 'geolocation',
                header: 'Geolocation',
                cell: info => (
                    <span className="inline-flex items-center">
                        {info.getValue() === 'World' ? '🌎 ' : '🏳️ '}
                        {info.getValue()}
                    </span>
                )
            },
            // Add new Details column
            {
                id: 'details',
                header: 'Details',
                cell: ({ row }) => (
                    <button
                        onClick={() => navigate(`/challenge/${row.original.id}`)}
                    >
                        🔍
                    </button>
                ),
            },
        ],
        [] // Empty dependency array since columns don't depend on any props or state
    )

    // Helper function to get country name from code
    const getCountryName = (code) => {
        const countryMap = {
            'IN': 'India',
            'JP': 'Japan',
            'US': 'United States',
            'GB': 'United Kingdom',
            'CA': 'Canada',
            'AU': 'Australia',
            'FR': 'France',
            'DE': 'Germany',
            'IT': 'Italy',
            'BR': 'Brazil',
        }
        return countryMap[code] || code
    }

    // Apply filters based on URL
    useEffect(() => {
        const path = location.pathname.substring(1)
        let newFilters = []

        if (location.pathname.startsWith('/country/')) {
            const countryCode = params.code?.toUpperCase()
            if (countryCode) {
                const countryName = getCountryName(countryCode)
                newFilters.push({ id: 'geolocation', value: countryName })
            }
        } else {
            switch (path) {
                case 'active':
                    newFilters.push({ id: 'status', value: 'Active' })
                    break
                case 'ended':
                    newFilters.push({ id: 'status', value: 'Ended' })
                    break
                case 'world':
                    newFilters.push({ id: 'geolocation', value: 'World' })
                    break
                case 'countries':
                    newFilters.push({ id: 'geolocation', value: ['India', 'Japan'] })
                    break
                case 'deterministic':
                    newFilters.push({ id: 'type', value: 'Deterministic' })
                    break
                case 'non-deterministic':
                    newFilters.push({ id: 'type', value: 'Non Deterministic' })
                    break
                default:
                    break
            }
        }

        setColumnFilters(newFilters)
    }, [location, params])

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            columnFilters,
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    })

    return (
        <div className="overflow-x-auto shadow-md rounded-lg">
            <table className="min-w-full bg-white">
                <thead className="bg-gray-50">
                    {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                                <th
                                    key={header.id}
                                    className="group px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={header.column.getToggleSortingHandler()}
                                >
                                    <div className="flex items-center justify-between">
                                        {flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                        <span className="ml-2 text-gray-400 opacity-0 group-hover:opacity-100">
                                            {{
                                                asc: '↑',
                                                desc: '↓',
                                            }[header.column.getIsSorted()] ?? '↕'}
                                        </span>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {table.getRowModel().rows.map(row => (
                        <tr 
                            key={row.id} 
                            className="hover:bg-gray-50 transition-colors"
                        >
                            {row.getVisibleCells().map(cell => (
                                <td
                                    key={cell.id}
                                    className="px-6 py-4 whitespace-nowrap"
                                >
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            {table.getRowModel().rows.length === 0 && (
                <div className="text-center py-8 text-gray-500 bg-gray-50">
                    <p className="text-lg">No results found</p>
                    <p className="text-sm mt-2">Try adjusting your filters</p>
                </div>
            )}
        </div>
    )
}

export default MainTable