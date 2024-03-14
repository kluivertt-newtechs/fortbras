create or replace procedure public.sp_update_diff_sx9(p_uuid varchar, p_tabela varchar)
language plpgsql
as $$
declare
       v_query_select_dict_1 varchar;
       v_query_diff varchar;
       reg record;
       reg_diff record;
       diff_count int := 0;
      _rows int := 0;

begin

    -- Marca registros que existe no dicionário 1, mas não existem no dicionário 2
	v_query_select_dict_1 := 'select s.* from ' || p_tabela || ' s left join ' || p_tabela || ' s2 on 
                            (
								s2.uuid = s.uuid and 
								s2.dict = 2 and	
								s2.x9_dom = s.x9_dom and 
								s2.x9_ident = s.x9_ident 
                            ) where s.uuid = ''' || p_uuid || ''' and 
								s.dict = 1 and 
								s2.id is null';
    for reg in execute v_query_select_dict_1
	loop
  
		diff_count := diff_count + 1;
		v_query_diff := 'update ' || p_tabela || ' set diff = ' || diff_count || ' where id = ' || reg.id || '';
        execute v_query_diff;
		
	end loop;

	-- Marca registros que existe no dicionário 2, mas não existem no dicionário 1
	v_query_select_dict_1 := 'select s.* from ' || p_tabela || ' s left join ' || p_tabela || ' s2 on 
                            (
								s2.uuid = s.uuid and 
								s2.dict = 1 and	
								s2.x9_dom = s.x9_dom and 
								s2.x9_ident = s.x9_ident 
                            ) where s.uuid = ''' || p_uuid || ''' and 
								s.dict = 2 and 
								s2.id is null';
    for reg in execute v_query_select_dict_1
	loop
  
		diff_count := diff_count + 1;
		v_query_diff := 'update ' || p_tabela || ' set diff = ' || diff_count || ' where id = ' || reg.id || '';
        execute v_query_diff;
		
	end loop;

	-- Marca registros que existem dos dois dicionários, mas possuem diferenças
	v_query_select_dict_1 := 'select s.id, s2.id as id_diff from ' || p_tabela || ' s left join ' || p_tabela || ' s2 on 
							(
								s2.x9_dom = s.x9_dom and 
								s2.x9_ident = s.x9_ident and
                                (
                                    s.x9_cdom    <>   s2.x9_cdom    or
                                    s.x9_expdom  <>   s2.x9_expdom  or
                                    s.x9_expcdom <>   s2.x9_expcdom or
                                    s.x9_propri  <>   s2.x9_propri  or
                                    s.x9_ligdom  <>   s2.x9_ligdom  or
                                    s.x9_ligcdom <>   s2.x9_ligcdom or
                                    s.x9_condsql <>   s2.x9_condsql or
                                    s.x9_usefil  <>   s2.x9_usefil  or
                                    s.x9_enable  <>   s2.x9_enable  or
                                    s.x9_vinfil  <>   s2.x9_vinfil  or
                                    s.x9_chvfor  <>   s2.x9_chvfor
                                )
							)
							where s.uuid = ''' || p_uuid || ''' and s.dict = 1 and s2.id is not null';
    for reg in execute v_query_select_dict_1
	loop
  
		diff_count := diff_count + 1;
		execute 'update ' || p_tabela || ' set diff = $2 where id in ($1)' using reg.id, diff_count;	                	
		execute 'update ' || p_tabela || ' set diff = $2 where id in ($1)' using reg.id_diff, diff_count;
		
	end loop;
end 
$$;
