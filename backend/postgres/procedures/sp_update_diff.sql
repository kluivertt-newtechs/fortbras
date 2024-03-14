create or replace procedure public.sp_update_diff(p_uuid varchar, p_tabela varchar)
language plpgsql
as $$
begin

    execute 'update ' || p_tabela || ' set diff = null where uuid = $1 and dict in(1,2) and diff is not null' using p_uuid;

    case
    when lower(p_tabela) like 'six%' then
        call sp_update_diff_six(p_uuid, p_tabela);
    when lower(p_tabela) like 'sx1%' then
        call sp_update_diff_sx1(p_uuid, p_tabela);
    when lower(p_tabela) like 'sx2%' then
        call sp_update_diff_sx2(p_uuid, p_tabela);
    when lower(p_tabela) like 'sx3%' then
        call sp_update_diff_sx3(p_uuid, p_tabela);
    when lower(p_tabela) like 'sx5%' then
        call sp_update_diff_sx5(p_uuid, p_tabela);
    when lower(p_tabela) like 'sx6%' then
        call sp_update_diff_sx6(p_uuid, p_tabela);
    when lower(p_tabela) like 'sx7%' then
        call sp_update_diff_sx7(p_uuid, p_tabela);
    when lower(p_tabela) like 'sx9%' then
        call sp_update_diff_sx9(p_uuid, p_tabela);
    when lower(p_tabela) like 'sxa%' then
        call sp_update_diff_sxa(p_uuid, p_tabela);
    when lower(p_tabela) like 'sxb%' then
        call sp_update_diff_sxb(p_uuid, p_tabela);
    when lower(p_tabela) like 'sxd%' then
        call sp_update_diff_sxd(p_uuid, p_tabela);
    when lower(p_tabela) like 'sxg%' then
        call sp_update_diff_sxg(p_uuid, p_tabela);
    else
        --raise exception 'unsupported table prefix: %', p_tabela;
    end case;

end 
$$;

--call public.sp_update_diff('65c304c5-1785-43e2-9ee3-e902a0c86d0e', 'six010')



